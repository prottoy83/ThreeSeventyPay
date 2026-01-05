const express = require("express");
const db = require("../config/db");
const router = express.Router();
const { generatePredictionsForUser } = require("./expensePrediction");

// New Payment to Partnered Places
router.post("/payment", (req, res) => {
    const { uid, pm_id, amount, recipient_name, trx_id } = req.body;

    if (!uid || !pm_id || !amount || !recipient_name || !trx_id) {
        return res.status(400).json({ error: "Missing required payment fields" });
    }

    if (trx_id.length !== 12) {
        return res.status(400).json({ error: "TRX ID must be exactly 12 characters" });
    }

    // Start transaction
    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: "Transaction start failed" });

        // 1. Check/Update balance of payment method
        const checkBalanceQuery = "SELECT balance FROM payment_method WHERE pm_id = ? AND user_id = ?";
        db.query(checkBalanceQuery, [pm_id, uid], (err, results) => {
            if (err || results.length === 0) {
                return db.rollback(() => res.status(404).json({ error: "Payment method not found" }));
            }

            const currentBalance = parseFloat(results[0].balance || 0);
            const paymentAmount = parseFloat(amount);

            if (currentBalance < paymentAmount) {
                return db.rollback(() => res.status(400).json({ error: "Insufficient balance" }));
            }

            // 2. Deduct balance
            const updateBalanceQuery = "UPDATE payment_method SET balance = balance - ? WHERE pm_id = ?";
            db.query(updateBalanceQuery, [paymentAmount, pm_id], (err) => {
                if (err) {
                    return db.rollback(() => res.status(500).json({ error: "Failed to deduct balance" }));
                }

                // 3. Record in transaction_record
                const recordQuery = `
                    INSERT INTO transaction_record 
                    (sender_id, pm_id, amount, transaction_type, trx_id, description, status) 
                    VALUES (?, ?, ?, 'PAYMENT', ?, ?, 'SUCCESS')
                `;
                const description = `Payment to ${recipient_name}`;

                db.query(recordQuery, [uid, pm_id, paymentAmount, trx_id, description], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error(err);
                            res.status(500).json({ error: "Failed to record transaction" });
                        });
                    }

                    db.commit((err) => {
                        if (err) return db.rollback(() => res.status(500).json({ error: "Commit failed" }));

                        // Trigger AI prediction generation in background (don't wait for it)
                        generatePredictionsForUser(uid, (predErr, predResult) => {
                            if (predErr) {
                                console.error('Background prediction generation error:', predErr);
                            } else {
                                console.log(`✅ AI predictions updated for user ${uid}`);
                            }
                        });

                        res.status(200).json({ message: "Payment successful", amount: paymentAmount, trx_id });
                    });
                });
            });
        });
    });
});

// Get recent transactions for a user
router.get("/history/:uid", (req, res) => {
    const uid = req.params.uid;
    const query = `
        SELECT * FROM transaction_record 
        WHERE sender_id = ? OR recipient_id = ?
        ORDER BY timestamp DESC 
        LIMIT 20
    `;
    db.query(query, [uid, uid], (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch history" });
        res.status(200).json(results);
    });
});

module.exports = router;
