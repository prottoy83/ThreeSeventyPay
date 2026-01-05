const express = require("express");
const db = require("../config/db");
const { nanoid } = require("nanoid");
const router = express.Router();

// Get referral stats for a user
router.get("/:uid", (req, res) => {
    const uid = req.params.uid;

    // Query to get list of referrals made by this user
    // We join with user table to get details of the referred person
    const query = `
        SELECT 
            r.referral_id,
            r.referred_id, 
            r.reward_amount, 
            r.created_at,
            u.first_name,
            u.last_name,
            u.email
        FROM referral r
        JOIN user u ON r.referred_id = u.uid
        WHERE r.referrer_id = ?
        ORDER BY r.created_at DESC
    `;

    db.query(query, [uid], (err, results) => {
        if (err) {
            console.error("Error fetching referrals:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Calculate total earned (all time - count each referral as $10)
        const totalEarned = results.length * 10;

        // Calculate current redeemable (only unclaimed rewards)
        const currentRedeemable = results.reduce((acc, curr) => acc + (parseFloat(curr.reward_amount) || 0), 0);

        // Calculate total redeemed (total earned - current redeemable)
        const totalRedeemed = totalEarned - currentRedeemable;

        // Add display info to referrals (historical $10 reward)
        const enhancedReferrals = results.map(ref => ({
            ...ref,
            display_amount: 10.00,
            status: parseFloat(ref.reward_amount) > 0 ? 'available' : 'redeemed'
        }));

        res.status(200).json({
            count: results.length,
            total_rewards: totalEarned,
            current_redeemable: currentRedeemable,
            total_redeemed: totalRedeemed,
            referrals: enhancedReferrals
        });
    });
});

// Generate referral code for a user (one-time only)
router.post("/generate-code", (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ error: "User ID is required" });
    }

    // First, check if user already has a referral code
    const checkQuery = "SELECT referral_code FROM user WHERE uid = ?";

    db.query(checkQuery, [uid], (err, results) => {
        if (err) {
            console.error("Error checking referral code:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // If user already has a code, return it
        if (results[0].referral_code) {
            return res.status(200).json({
                message: "Referral code already exists",
                referral_code: results[0].referral_code
            });
        }

        // Generate a new unique referral code
        const newCode = nanoid(10);
        const updateQuery = "UPDATE user SET referral_code = ? WHERE uid = ?";

        db.query(updateQuery, [newCode, uid], (err) => {
            if (err) {
                console.error("Error generating referral code:", err);

                // Handle duplicate code (very rare with nanoid)
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        error: "Code generation conflict. Please try again."
                    });
                }

                return res.status(500).json({ error: "Failed to generate code" });
            }

            res.status(201).json({
                message: "Referral code generated successfully",
                referral_code: newCode
            });
        });
    });
});

// Transfer referral earnings to a payment method
router.post("/transfer-earnings", (req, res) => {
    const { uid, pm_id } = req.body;

    if (!uid || !pm_id) {
        return res.status(400).json({ error: "User ID and payment method ID are required" });
    }

    // Start transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ error: "Failed to start transaction" });
        }

        // Get total unclaimed referral earnings
        const getEarningsQuery = `
            SELECT SUM(reward_amount) as total_earnings 
            FROM referral 
            WHERE referrer_id = ? AND reward_amount > 0
        `;

        db.query(getEarningsQuery, [uid], (err, earningsResult) => {
            if (err) {
                return db.rollback(() => {
                    console.error("Error fetching earnings:", err);
                    res.status(500).json({ error: "Failed to fetch earnings" });
                });
            }

            const totalEarnings = earningsResult[0]?.total_earnings || 0;

            if (totalEarnings <= 0) {
                return db.rollback(() => {
                    res.status(400).json({ error: "No earnings available to transfer" });
                });
            }

            // Verify payment method belongs to user
            const verifyPmQuery = "SELECT pm_id FROM payment_method WHERE pm_id = ? AND user_id = ?";

            db.query(verifyPmQuery, [pm_id, uid], (err, pmResult) => {
                if (err || pmResult.length === 0) {
                    return db.rollback(() => {
                        console.error("Payment method verification error:", err);
                        res.status(404).json({ error: "Payment method not found or doesn't belong to user" });
                    });
                }

                // Add earnings to payment method balance
                const updateBalanceQuery = `
                    UPDATE payment_method 
                    SET balance = COALESCE(balance, 0) + ? 
                    WHERE pm_id = ?
                `;

                db.query(updateBalanceQuery, [totalEarnings, pm_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Balance update error:", err);
                            res.status(500).json({ error: "Failed to update balance" });
                        });
                    }

                    // Clear transferred earnings by setting reward_amount to 0
                    const clearEarningsQuery = `
                        UPDATE referral 
                        SET reward_amount = 0 
                        WHERE referrer_id = ? AND reward_amount > 0
                    `;

                    db.query(clearEarningsQuery, [uid], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Clear earnings error:", err);
                                res.status(500).json({ error: "Failed to clear earnings" });
                            });
                        }

                        // Record in transaction_record
                        const recordTransactionQuery = `
                            INSERT INTO transaction_record 
                            (sender_id, pm_id, amount, transaction_type, description, status) 
                            VALUES (?, ?, ?, 'REFERRAL', 'Referral reward redemption', 'SUCCESS')
                        `;
                        db.query(recordTransactionQuery, [uid, pm_id, totalEarnings], (err) => {
                            if (err) {
                                return db.rollback(() => {
                                    console.error("Failed to record referral transaction:", err);
                                    res.status(500).json({ error: "Failed to record transaction history" });
                                });
                            }

                            // Commit transaction
                            db.commit((err) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error("Commit error:", err);
                                        res.status(500).json({ error: "Failed to commit transaction" });
                                    });
                                }

                                res.status(200).json({
                                    message: "Earnings transferred successfully",
                                    amount_transferred: totalEarnings
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
