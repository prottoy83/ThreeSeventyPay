const express = require("express");
const axios = require("axios");
const router = express.Router();

// Approximate BDT exchange rates (updated periodically)
// These are fallback rates when the API doesn't support BDT
const BDT_RATES = {
    USD: 0.0084,  // 1 BDT ≈ 0.0084 USD (1 USD ≈ 119 BDT)
    EUR: 0.0077,  // 1 BDT ≈ 0.0077 EUR
    GBP: 0.0066,  // 1 BDT ≈ 0.0066 GBP
    CNY: 0.061,   // 1 BDT ≈ 0.061 CNY
    RUB: 0.84,    // 1 BDT ≈ 0.84 RUB
};

// Get available currencies
router.get("/currencies", async (req, res) => {
    try {
        const response = await axios.get("https://api.frankfurter.app/currencies");
        // Add BDT to the list
        const currencies = {
            ...response.data,
            BDT: "Bangladeshi Taka"
        };
        res.status(200).json(currencies);
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

        const numAmount = parseFloat(amount);

        // Handle BDT conversions using fallback rates
        if (from === "BDT" && BDT_RATES[to]) {
            const converted = numAmount * BDT_RATES[to];
            const rate = BDT_RATES[to];

            return res.status(200).json({
                amount: numAmount,
                from: from,
                to: to,
                converted: converted,
                rate: rate,
                date: new Date().toISOString().split('T')[0],
                note: "Using approximate exchange rate"
            });
        } else if (to === "BDT" && BDT_RATES[from]) {
            const converted = numAmount / BDT_RATES[from];
            const rate = 1 / BDT_RATES[from];

            return res.status(200).json({
                amount: numAmount,
                from: from,
                to: to,
                converted: converted,
                rate: rate,
                date: new Date().toISOString().split('T')[0],
                note: "Using approximate exchange rate"
            });
        }

        // For non-BDT conversions, use Frankfurter API
        const response = await axios.get(
            `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
        );

        res.status(200).json({
            amount: numAmount,
            from: from,
            to: to,
            converted: response.data.rates[to],
            rate: response.data.rates[to] / numAmount,
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
