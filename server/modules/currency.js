const express = require("express");
const axios = require("axios");
const router = express.Router();

// Get available currencies
router.get("/currencies", async (req, res) => {
    try {
        const response = await axios.get("https://api.frankfurter.app/currencies");
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error fetching currencies:", error);
        res.status(500).json({ error: "Failed to fetch currencies" });
    }
});

// Convert currency
router.get("/convert", async (req, res) => {
    try {
        const { amount, from, to } = req.query;

        if (!amount || !from || !to) {
            return res.status(400).json({
                error: "Missing required parameters: amount, from, to"
            });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                error: "Amount must be a positive number"
            });
        }

        const response = await axios.get(
            `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
        );

        res.status(200).json({
            amount: parseFloat(amount),
            from: from,
            to: to,
            converted: response.data.rates[to],
            rate: response.data.rates[to] / amount,
            date: response.data.date
        });
    } catch (error) {
        console.error("Error converting currency:", error);

        if (error.response?.status === 404) {
            return res.status(400).json({
                error: "Invalid currency code provided"
            });
        }

        res.status(500).json({
            error: "Failed to convert currency"
        });
    }
});

module.exports = router;
