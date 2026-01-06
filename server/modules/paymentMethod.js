const express = require("express");
const db = require("../config/db");
const { generatePredictionsForUser } = require("./expensePrediction");

const router = express.Router();


router.get('/method/:uid', (req, res) => {
    const query = "SELECT pm_id, method_type, branch_name, acc_no, routing_number, card_no, exp_date, balance FROM payment_method WHERE user_id = ?"

    db.query(query, [req.params.uid], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        
        return res.status(200).json({ methods: results || [] });
    })
})

router.put('/addMoney', (req, res) => {
    const { pm_id, amount } = req.body;

    if (!pm_id || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid payment method or amount' });
    }

    
    db.query("SELECT user_id FROM payment_method WHERE pm_id = ?", [pm_id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: "Payment method not found" });
        }
        const uid = results[0].user_id;

        const query = "UPDATE payment_method SET balance = CASE WHEN balance IS NULL THEN ? ELSE balance + ? END WHERE pm_id = ?";
        db.query(query, [amount, amount, pm_id], (err, result) => {
            if (err) {
                console.error('Add money error:', err);
                return res.status(500).json({ message: 'Failed to add money' });
            }

            
            const recordQuery = "INSERT INTO transaction_record (sender_id, pm_id, amount, transaction_type, description, status) VALUES (?, ?, ?, 'ADD_MONEY', 'Deposited money to account', 'SUCCESS')";
            db.query(recordQuery, [uid, pm_id, amount], (txErr) => {
                if (txErr) console.error('Failed to record addMoney transaction:', txErr);

                
                generatePredictionsForUser(uid, (predErr) => {
                    if (predErr) {
                        console.error('Background prediction generation error:', predErr);
                    } else {
                        console.log(`AI predictions updated for user ${uid}`);
                    }
                });

                return res.status(200).json({ message: 'Money added successfully' });
            });
        });
    });
});


router.get('/totalBalance/:uid', (req, res) => {
    const query = "SELECT SUM(balance) as totalBalance FROM payment_method WHERE user_id = ?"

    db.query(query, [req.params.uid], (err, result) => {
        if (err) {
            console.error('Balance error:', err);
            return res.status(500).json({ message: "Could not get balance" });
        }

        return res.status(200).json({
            balance: result[0]?.totalBalance || 0
        });
    });
})

router.post('/addMethod/:uid', (req, res) => {
    const { method, acc_no, bank_name, routing_number, card_no, exp_date, cvv } = req.body;

    if (!method || !['bank','card'].includes(method)) {
        return res.status(400).json({ error: 'Invalid method type. Use "bank" or "card".' });
    }

    db.query('SELECT uid FROM user WHERE uid = ?', [req.params.uid], (userErr, userRows) => {
        if (userErr) {
            console.error('User lookup error:', userErr);
            return res.status(500).json({ message: 'Error verifying user' });
        }
        if (!userRows || userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (method === 'bank') {
            const query = `
                INSERT INTO payment_method 
                (user_id, branch_name, method_type, acc_no, routing_number)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(query, [req.params.uid, bank_name, 'bank', acc_no, routing_number], (err, result) => {
                if (err) {
                    console.error('Bank adding error:', err);
                    return res.status(500).json({ message: 'Error, couldn\'t add bank account' });
                }

                const newPmId = result?.insertId;

                
                const checkRewardsQuery = `
                    SELECT SUM(reward_amount) as total_rewards 
                    FROM referral 
                    WHERE referred_id = ? AND reward_amount > 0
                `;

                db.query(checkRewardsQuery, [req.params.uid], (rewardErr, rewardResult) => {
                    if (rewardErr) {
                        console.error('Reward check error:', rewardErr);
                        return res.status(201).json({
                            message: 'Bank account added successfully',
                            pm_id: newPmId
                        });
                    }

                    const totalRewards = rewardResult[0]?.total_rewards || 0;

                    if (totalRewards > 0) {
                        
                        const updateBalanceQuery = `
                            UPDATE payment_method 
                            SET balance = COALESCE(balance, 0) + ? 
                            WHERE pm_id = ?
                        `;

                        db.query(updateBalanceQuery, [totalRewards, newPmId], (balanceErr) => {
                            if (balanceErr) {
                                console.error('Balance update error:', balanceErr);
                                return res.status(201).json({
                                    message: 'Bank account added successfully',
                                    pm_id: newPmId
                                });
                            }

                            
                            const claimRewardsQuery = `
                                UPDATE referral 
                                SET reward_amount = 0 
                                WHERE referred_id = ? AND reward_amount > 0
                            `;

                            db.query(claimRewardsQuery, [req.params.uid], (claimErr) => {
                                if (claimErr) console.error('Claim rewards error:', claimErr);

                                
                                const recordTxQuery = "INSERT INTO transaction_record (sender_id, pm_id, amount, transaction_type, description, status) VALUES (?, ?, ?, 'REFERRAL', 'Referral signup reward', 'SUCCESS')";
                                db.query(recordTxQuery, [req.params.uid, newPmId, totalRewards], (txErr) => {
                                    if (txErr) console.error('Failed to record referral signup reward:', txErr);

                                    return res.status(201).json({
                                        message: 'Bank account added successfully. Referral rewards transferred!',
                                        pm_id: newPmId,
                                        rewards_transferred: totalRewards
                                    });
                                });
                            });
                        });
                    } else {
                        return res.status(201).json({
                            message: 'Bank account added successfully',
                            pm_id: newPmId
                        });
                    }
                });
            });
        }

        else {
            const query = `
                INSERT INTO payment_method 
                (user_id, method_type, card_no, exp_date, cvv)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(query, [req.params.uid, 'card', card_no, exp_date, cvv], (err, result) => {
                if (err) {
                    console.error('Card adding error:', err);
                    return res.status(500).json({ message: 'Error, couldn\'t add card' });
                }
                return res.status(201).json({ message: 'Card added successfully', pm_id: result?.insertId });
            });
        }
    });
});

router.delete('/deleteMethod/:pm_id', (req, res) => {
    const query = "DELETE FROM payment_method WHERE pm_id = ?"

    db.query(query, [req.params.pm_id], (err, result) => {
        if (err) {
            console.error('Delete error:', err);
            return res.status(500).json({ message: 'Error deleting payment method' });
        }

        return res.status(200).json({ message: 'Payment method deleted successfully' });
    })
})

module.exports = router;

