const express = require("express");
const db = require("../config/db");
const { nanoid } = require("nanoid");

const router = express.Router();

// Create a payment link
router.post("/create", (req, res) => {
    const { user_id, amount, expiry_hours, pm_id } = req.body;

    if (!user_id || !amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid user ID or amount" });
    }

    // Generate unique URL identifier
    const linkId = nanoid(12);
    const url = `${linkId}`;

    // Calculate expiry timestamp (default 24 hours if not specified)
    const expiryHours = expiry_hours || 24;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);

    const query = `
    INSERT INTO pay_link 
    (user_id, url, amount, expiry, pm_id)
    VALUES (?, ?, ?, ?, ?)
  `;

    db.query(query, [user_id, url, amount, expiryDate, pm_id], (err, result) => {
        if (err) {
            console.error("Create payment link error:", err);
            return res.status(500).json({ message: "Failed to create payment link" });
        }

        return res.status(201).json({
            message: "Payment link created successfully",
            link_id: result.insertId,
            url: url,
            full_url: `http://localhost:5173/pay/${url}`,
            expiry: expiryDate,
        });
    });
});

// Get payment link details by URL
router.get("/details/:url", (req, res) => {
    const query = `
    SELECT pl.*, u.first_name, u.last_name, u.email,
           pm.method_type, pm.acc_no, pm.card_no
    FROM pay_link pl
    JOIN user u ON pl.user_id = u.uid
    LEFT JOIN payment_method pm ON pl.pm_id = pm.pm_id
    WHERE pl.url = ?
  `;

    db.query(query, [req.params.url], (err, results) => {
        if (err) {
            console.error("Get payment link error:", err);
            return res.status(500).json({ message: "Failed to fetch payment link" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Payment link not found" });
        }

        const link = results[0];

        // Check if expired
        const now = new Date();
        const expiry = new Date(link.expiry);
        if (now > expiry) {
            return res.status(410).json({ message: "Payment link has expired" });
        }

        // Check if already used
        if (link.used) {
            return res.status(410).json({ message: "Payment link has already been used" });
        }

        return res.status(200).json({
            link_id: link.link_id,
            amount: link.amount,
            recipient_name: `${link.first_name} ${link.last_name}`,
            recipient_email: link.email,
            expiry: link.expiry,
            created_at: link.created_at,
        });
    });
});

// Process payment via link
router.post("/pay/:url", (req, res) => {
    const { payer_id, pm_id } = req.body;
    const { url } = req.params;

    if (!payer_id || !pm_id) {
        return res.status(400).json({ message: "Payer ID and payment method required" });
    }

    // Start transaction
    db.beginTransaction((err) => {
        if (err) {
            console.error("Transaction start error:", err);
            return res.status(500).json({ message: "Transaction failed to start" });
        }

        // Get payment link details
        const getLinkQuery = `
      SELECT * FROM pay_link WHERE url = ?
    `;

        db.query(getLinkQuery, [url], (err, linkResults) => {
            if (err || linkResults.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({ message: "Payment link not found" });
                });
            }

            const link = linkResults[0];

            // Validate link
            const now = new Date();
            const expiry = new Date(link.expiry);
            if (now > expiry) {
                return db.rollback(() => {
                    res.status(410).json({ message: "Payment link has expired" });
                });
            }

            if (link.used) {
                return db.rollback(() => {
                    res.status(410).json({ message: "Payment link already used" });
                });
            }

            // Check payer's balance
            const checkBalanceQuery = `
        SELECT balance FROM payment_method WHERE pm_id = ? AND user_id = ?
      `;

            db.query(checkBalanceQuery, [pm_id, payer_id], (err, pmResults) => {
                if (err || pmResults.length === 0) {
                    return db.rollback(() => {
                        res.status(404).json({ message: "Payment method not found" });
                    });
                }

                const payerBalance = pmResults[0].balance || 0;
                if (payerBalance < link.amount) {
                    return db.rollback(() => {
                        res.status(400).json({ message: "Insufficient balance" });
                    });
                }

                // Deduct from payer
                const deductQuery = `
          UPDATE payment_method 
          SET balance = balance - ? 
          WHERE pm_id = ? AND user_id = ?
        `;

                db.query(deductQuery, [link.amount, pm_id, payer_id], (err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error("Deduct error:", err);
                            res.status(500).json({ message: "Failed to deduct amount" });
                        });
                    }

                    // Add to recipient
                    const addQuery = `
            UPDATE payment_method 
            SET balance = CASE WHEN balance IS NULL THEN ? ELSE balance + ? END
            WHERE pm_id = ?
          `;

                    db.query(addQuery, [link.amount, link.amount, link.pm_id], (err) => {
                        if (err) {
                            return db.rollback(() => {
                                console.error("Add error:", err);
                                res.status(500).json({ message: "Failed to add amount" });
                            });
                        }

                        // Create transaction record
                        const transactionQuery = `
              INSERT INTO transaction_record 
              (sender_id, recipient_id, pm_id, amount, status)
              VALUES (?, ?, ?, ?, 'Completed')
            `;

                        db.query(
                            transactionQuery,
                            [payer_id, link.user_id, pm_id, link.amount],
                            (err, txResult) => {
                                if (err) {
                                    return db.rollback(() => {
                                        console.error("Transaction record error:", err);
                                        res.status(500).json({ message: "Failed to record transaction" });
                                    });
                                }

                                // Mark link as used
                                const markUsedQuery = `
                  UPDATE pay_link 
                  SET used = 1, used_at = NOW() 
                  WHERE link_id = ?
                `;

                                db.query(markUsedQuery, [link.link_id], (err) => {
                                    if (err) {
                                        return db.rollback(() => {
                                            console.error("Mark used error:", err);
                                            res.status(500).json({ message: "Failed to mark link as used" });
                                        });
                                    }

                                    // Commit transaction
                                    db.commit((err) => {
                                        if (err) {
                                            return db.rollback(() => {
                                                console.error("Commit error:", err);
                                                res.status(500).json({ message: "Failed to commit transaction" });
                                            });
                                        }

                                        return res.status(200).json({
                                            message: "Payment successful",
                                            transaction_id: txResult.insertId,
                                            amount: link.amount,
                                        });
                                    });
                                });
                            }
                        );
                    });
                });
            });
        });
    });
});

// Get user's created payment links
router.get("/user/:uid", (req, res) => {
    const query = `
    SELECT pl.*, pm.method_type, pm.acc_no, pm.card_no
    FROM pay_link pl
    LEFT JOIN payment_method pm ON pl.pm_id = pm.pm_id
    WHERE pl.user_id = ?
    ORDER BY pl.created_at DESC
  `;

    db.query(query, [req.params.uid], (err, results) => {
        if (err) {
            console.error("Get user links error:", err);
            return res.status(500).json({ message: "Failed to fetch payment links" });
        }

        const links = results.map((link) => ({
            link_id: link.link_id,
            url: link.url,
            full_url: `http://localhost:5173/pay/${link.url}`,
            amount: link.amount,
            expiry: link.expiry,
            used: link.used || false,
            used_at: link.used_at,
            created_at: link.created_at,
            method_type: link.method_type,
            is_expired: new Date() > new Date(link.expiry),
        }));

        return res.status(200).json({ links });
    });
});

module.exports = router;
