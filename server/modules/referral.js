const express = require("express");
const db = require("../config/db");
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

        // Calculate total earned
        const totalEarned = results.reduce((acc, curr) => acc + (parseFloat(curr.reward_amount) || 0), 0);

        res.status(200).json({
            count: results.length,
            total_rewards: totalEarned,
            referrals: results
        });
    });
});

module.exports = router;
