const express = require("express");
const brain = require("brain.js/src/index");
const db = require("../config/db");

const router = express.Router();

function categorizeTransaction(description) {
    const desc = description.toLowerCase();

    // Define category keywords
    const categories = {
        'Food & Dining': ['restaurant', 'food', 'cafe', 'dining', 'pizza', 'burger', 'coffee'],
        'Shopping': ['shop', 'store', 'mall', 'amazon', 'retail', 'clothing'],
        'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'transport', 'parking'],
        'Entertainment': ['movie', 'cinema', 'game', 'entertainment', 'netflix', 'spotify'],
        'Bills & Utilities': ['bill', 'utility', 'electric', 'water', 'internet', 'phone'],
        'Healthcare': ['hospital', 'pharmacy', 'doctor', 'medical', 'health'],
        'Transfer': ['transfer', 'send', 'payment'],
        'Other': []
    };

    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => desc.includes(keyword))) {
            return category;
        }
    }

    return 'Other';
}

/**
 * Normalize data for neural network
 * Converts month (1-12) and amount to 0-1 range
 */
function normalizeInput(month, avgAmount, maxAmount = 10000) {
    return {
        month: month / 12,
        avgAmount: Math.min(avgAmount / maxAmount, 1)
    };
}

/**
 * Denormalize output from neural network
 */
function denormalizeOutput(normalizedAmount, maxAmount = 10000) {
    return normalizedAmount * maxAmount;
}

/**
 * Prepare training data from transaction history
 */
function prepareTrainingData(transactions) {
    // Group transactions by month and category
    const monthlyData = {};

    transactions.forEach(tx => {
        const date = new Date(tx.timestamp);
        const month = date.getMonth() + 1; // 1-12
        const year = date.getFullYear();
        const category = categorizeTransaction(tx.description || '');
        const key = `${year}-${month}-${category}`;

        if (!monthlyData[key]) {
            monthlyData[key] = {
                month,
                year,
                category,
                total: 0,
                count: 0
            };
        }

        monthlyData[key].total += parseFloat(tx.amount || 0);
        monthlyData[key].count += 1;
    });

    // Convert to training format
    const trainingData = [];
    const categoryData = {};

    Object.values(monthlyData).forEach(data => {
        const avg = data.total / data.count;

        if (!categoryData[data.category]) {
            categoryData[data.category] = [];
        }

        categoryData[data.category].push({
            month: data.month,
            amount: avg
        });
    });

    
    Object.entries(categoryData).forEach(([category, dataPoints]) => {
        // Sort by month
        dataPoints.sort((a, b) => a.month - b.month);

        // Create training pairs (use previous months to predict next)
        for (let i = 0; i < dataPoints.length - 1; i++) {
            const normalized = normalizeInput(dataPoints[i].month, dataPoints[i].amount);
            const nextNormalized = normalizeInput(dataPoints[i + 1].month, dataPoints[i + 1].amount);

            trainingData.push({
                input: [normalized.month, normalized.avgAmount],
                output: [nextNormalized.avgAmount]
            });
        }
    });

    return { trainingData, categoryData };
}

/**
 * Train neural network and generate predictions
 * Works with ANY amount of transaction data - no time requirements
 */
function trainAndPredict(transactions, targetMonth) {
    const { trainingData, categoryData } = prepareTrainingData(transactions);

    // If no transactions at all
    if (transactions.length === 0) {
        return {
            success: false,
            message: "No transaction history found. Start making transactions to get AI predictions!",
            predictions: []
        };
    }

    // If only 1-2 transactions, just show simple averages (no AI needed)
    if (transactions.length < 3) {
        const predictions = [];
        const categoryTotals = {};

        transactions.forEach(tx => {
            const category = categorizeTransaction(tx.description || '');
            const amount = parseFloat(tx.amount || 0);

            if (!categoryTotals[category]) {
                categoryTotals[category] = { total: 0, count: 0 };
            }
            categoryTotals[category].total += amount;
            categoryTotals[category].count += 1;
        });

        Object.entries(categoryTotals).forEach(([category, data]) => {
            const avg = data.total / data.count;
            predictions.push({
                category,
                predictedAmount: Math.round(avg * 100) / 100,
                historicalAverage: Math.round(avg * 100) / 100,
                confidence: 50 // Low confidence with little data
            });
        });

        return {
            success: true,
            predictions: predictions.sort((a, b) => b.predictedAmount - a.predictedAmount),
            totalPredicted: predictions.reduce((sum, p) => sum + p.predictedAmount, 0),
            trainingDataPoints: transactions.length,
            note: "Limited data - showing simple averages"
        };
    }

    // If we have 3+ transactions, use AI
    const predictions = [];

    Object.entries(categoryData).forEach(([category, dataPoints]) => {
        // Calculate simple average
        const avgAmount = dataPoints.reduce((sum, dp) => sum + dp.amount, 0) / dataPoints.length;

        // If we have enough data points for this category, use AI
        if (dataPoints.length >= 2 && trainingData.length >= 2) {
            try {
                // Create and train neural network
                const net = new brain.NeuralNetwork({
                    hiddenLayers: [3, 2],
                    activation: 'sigmoid',
                    gpu: false
                });

                net.train(trainingData, {
                    iterations: 1000,
                    errorThresh: 0.01,
                    log: false
                });

                // Use the most recent data point
                const latest = dataPoints[dataPoints.length - 1];
                const normalized = normalizeInput(targetMonth, latest.amount);

                const prediction = net.run([normalized.month, normalized.avgAmount]);
                const predictedAmount = denormalizeOutput(prediction[0]);

                predictions.push({
                    category,
                    predictedAmount: Math.round(predictedAmount * 100) / 100,
                    historicalAverage: Math.round(avgAmount * 100) / 100,
                    confidence: Math.min((dataPoints.length / 3) * 100, 100) // More data = higher confidence
                });
            } catch (error) {
                // If AI fails, fall back to average
                console.log(`AI failed for ${category}, using average`);
                predictions.push({
                    category,
                    predictedAmount: Math.round(avgAmount * 100) / 100,
                    historicalAverage: Math.round(avgAmount * 100) / 100,
                    confidence: 60
                });
            }
        } else {
            // Not enough data for AI, use average
            predictions.push({
                category,
                predictedAmount: Math.round(avgAmount * 100) / 100,
                historicalAverage: Math.round(avgAmount * 100) / 100,
                confidence: Math.min(dataPoints.length * 30, 70) // Scale confidence with data
            });
        }
    });

    return {
        success: true,
        predictions: predictions.sort((a, b) => b.predictedAmount - a.predictedAmount),
        totalPredicted: predictions.reduce((sum, p) => sum + p.predictedAmount, 0),
        trainingDataPoints: trainingData.length
    };
}

/**
 * Generate and store AI predictions for a user
 */
function generateAndStorePredictions(uid, callback) {
    const currentDate = new Date();
    const targetMonth = currentDate.getMonth() + 2; // Next month (1-12)
    const targetYear = currentDate.getFullYear();

    // Fetch ALL user's transaction history (no time limit)
    const query = `
        SELECT amount, description, timestamp, transaction_type
        FROM transaction_record 
        WHERE sender_id = ? 
        AND transaction_type IN ('PAYMENT', 'TRANSFER', 'ADD_MONEY')
        ORDER BY timestamp ASC
    `;

    db.query(query, [uid], (err, transactions) => {
        if (err) {
            console.error("Prediction query error:", err);
            return callback(err, null);
        }

        if (!transactions || transactions.length === 0) {
            return callback(null, {
                success: false,
                message: "No transaction history found. Start making transactions to get AI predictions!",
                predictions: []
            });
        }

        try {
            const result = trainAndPredict(transactions, targetMonth);

            console.log(`📊 Prediction result for user ${uid}:`, {
                success: result.success,
                message: result.message,
                predictionCount: result.predictions?.length || 0,
                totalPredicted: result.totalPredicted
            });

            if (!result.success) {
                console.log(`⚠️  Not storing predictions - ${result.message}`);
                return callback(null, result);
            }

            console.log(`Storing ${result.predictions.length} predictions to database...`);

            // Store predictions in database
            const deleteOldQuery = `
                DELETE FROM ai_prediction 
                WHERE user_id = ? AND prediction_month = ? AND prediction_year = ?
            `;

            db.query(deleteOldQuery, [uid, targetMonth, targetYear], (delErr) => {
                if (delErr) {
                    console.error("Delete old predictions error:", delErr);
                    console.error(" Query:", deleteOldQuery);
                    console.error("Params:", [uid, targetMonth, targetYear]);
                }

                // Insert new predictions
                const insertPromises = result.predictions.map(pred => {
                    return new Promise((resolve, reject) => {
                        const insertQuery = `
                            INSERT INTO ai_prediction 
                            (user_id, category, predicted_amount, historical_average, confidence, prediction_month, prediction_year)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        `;

                        console.log(`📝 Inserting prediction: ${pred.category} = $${pred.predictedAmount}`);

                        db.query(insertQuery, [
                            uid,
                            pred.category,
                            pred.predictedAmount,
                            pred.historicalAverage,
                            pred.confidence,
                            targetMonth,
                            targetYear
                        ], (insertErr) => {
                            if (insertErr) {
                                console.error("INSERT ERROR:", insertErr.message);
                                console.error(" SQL:", insertErr.sql);
                                console.error("Code:", insertErr.code);
                                console.error("Data:", {
                                    user_id: uid,
                                    category: pred.category,
                                    predicted_amount: pred.predictedAmount,
                                    historical_average: pred.historicalAverage,
                                    confidence: pred.confidence,
                                    prediction_month: targetMonth,
                                    prediction_year: targetYear
                                });
                                reject(insertErr);
                            } else {
                                console.log(`Inserted ${pred.category}`);
                                resolve();
                            }
                        });
                    });
                });

                Promise.all(insertPromises)
                    .then(() => {
                        console.log(`All ${insertPromises.length} predictions stored successfully!`);
                        callback(null, result);
                    })
                    .catch(insertErr => {
                        console.error("Promise.all failed:", insertErr);
                        callback(null, result);
                    });
            });
        } catch (error) {
            console.error("Prediction error:", error);
            callback(error, null);
        }
    });
}


router.get("/predictions/:uid", (req, res) => {
    const uid = req.params.uid;
    const currentDate = new Date();
    const targetMonth = currentDate.getMonth() + 2; 
    const targetYear = currentDate.getFullYear();

    
    const query = `
        SELECT category, predicted_amount, historical_average, confidence, updated_at
        FROM ai_prediction 
        WHERE user_id = ? AND prediction_month = ? AND prediction_year = ?
        ORDER BY predicted_amount DESC
    `;

    db.query(query, [uid, targetMonth, targetYear], (err, predictions) => {
        if (err) {
            console.error("Fetch predictions error:", err);
            return res.status(500).json({ error: "Failed to fetch predictions" });
        }


        if (predictions && predictions.length > 0) {
            const lastUpdate = new Date(predictions[0].updated_at);
            const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);

            if (hoursSinceUpdate < 24) {
                
                const formattedPredictions = predictions.map(p => ({
                    category: p.category,
                    predictedAmount: parseFloat(p.predicted_amount),
                    historicalAverage: parseFloat(p.historical_average),
                    confidence: parseFloat(p.confidence)
                }));

                const totalPredicted = formattedPredictions.reduce((sum, p) => sum + p.predictedAmount, 0);

                return res.status(200).json({
                    success: true,
                    predictions: formattedPredictions,
                    totalPredicted: Math.round(totalPredicted * 100) / 100,
                    trainingDataPoints: formattedPredictions.length * 4, 
                    cached: true
                });
            }
        }


        generateAndStorePredictions(uid, (genErr, result) => {
            if (genErr) {
                return res.status(500).json({
                    success: false,
                    error: "Failed to generate predictions",
                    message: genErr.message
                });
            }
            res.status(200).json(result);
        });
    });
});


router.post("/generate/:uid", (req, res) => {
    const uid = req.params.uid;

    generateAndStorePredictions(uid, (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: "Failed to generate predictions",
                message: err.message
            });
        }
        res.status(200).json(result);
    });
});

/**
 * GET /api/predictions/insights/:uid
 * Get detailed spending insights and trends
 */
router.get("/insights/:uid", (req, res) => {
    const uid = req.params.uid;

    const query = `
        SELECT amount, description, timestamp, transaction_type
        FROM transaction_record 
        WHERE sender_id = ? 
        AND transaction_type IN ('PAYMENT', 'TRANSFER')
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        ORDER BY timestamp DESC
    `;

    db.query(query, [uid], (err, transactions) => {
        if (err) {
            return res.status(500).json({ error: "Failed to fetch insights" });
        }

        if (!transactions || transactions.length === 0) {
            return res.status(200).json({
                totalSpent: 0,
                categoryBreakdown: [],
                monthlyTrend: [],
                transactionCount: 0
            });
        }

        // Calculate insights
        const categoryTotals = {};
        const monthlyTotals = {};
        let totalSpent = 0;

        transactions.forEach(tx => {
            const category = categorizeTransaction(tx.description || '');
            const amount = parseFloat(tx.amount || 0);
            const date = new Date(tx.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            totalSpent += amount;

            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
            monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + amount;
        });

        const categoryBreakdown = Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount: Math.round(amount * 100) / 100,
                percentage: Math.round((amount / totalSpent) * 100)
            }))
            .sort((a, b) => b.amount - a.amount);

        const monthlyTrend = Object.entries(monthlyTotals)
            .map(([month, amount]) => ({
                month,
                amount: Math.round(amount * 100) / 100
            }))
            .sort((a, b) => a.month.localeCompare(b.month));

        res.status(200).json({
            totalSpent: Math.round(totalSpent * 100) / 100,
            categoryBreakdown,
            monthlyTrend,
            transactionCount: transactions.length
        });
    });
});

// Export both router and helper function
module.exports = router;
module.exports.generatePredictionsForUser = generateAndStorePredictions;

