const express = require("express");
const db = require("../config/db");

const router = express.Router();

router.get('/method/:uid', (req,res) => {
    const query = "SELECT pm_id, method_type, acc_no, routing_number, card_no, exp_date, branch_name FROM payment_method WHERE user_id = ?"

    db.query(query, [req.params.uid], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        console.log('results:', results);
        return res.status(200).json({ methods: results || [] });
    })
})

router.get('/totalBalance/:uid', (req,res)=> {
    const query = "SELECT SUM(balance) as totalBalance FROM payment_method WHERE user_id = ?"

    db.query(query, [req.params.uid], (err, result)=> {
        if(err){
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

    if (!method || !['bank', 'card'].includes(method)) {
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
                return res.status(201).json({ message: 'Bank account added successfully', pm_id: result?.insertId });
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

