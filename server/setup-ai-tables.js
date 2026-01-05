const db = require('./config/db');

console.log('🔧 Setting up AI Prediction tables...\n');

// Create ai_prediction table
const createPredictionTable = `
CREATE TABLE IF NOT EXISTS ai_prediction (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    predicted_amount DECIMAL(10, 2) NOT NULL,
    historical_average DECIMAL(10, 2) NOT NULL,
    confidence DECIMAL(5, 2) NOT NULL,
    prediction_month INT NOT NULL,
    prediction_year INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_category_month (user_id, category, prediction_month, prediction_year),
    INDEX idx_user_id (user_id),
    INDEX idx_prediction_date (prediction_year, prediction_month)
)`;

// Create ai_insights table
const createInsightsTable = `
CREATE TABLE IF NOT EXISTS ai_insights (
    insight_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    total_spent DECIMAL(10, 2) NOT NULL,
    transaction_count INT NOT NULL,
    category_breakdown JSON,
    monthly_trend JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_insights (user_id),
    INDEX idx_user_id (user_id)
)`;

// Execute table creation
db.query(createPredictionTable, (err) => {
    if (err) {
        console.error('❌ Error creating ai_prediction table:', err);
        process.exit(1);
    }
    console.log('✅ ai_prediction table created successfully');

    db.query(createInsightsTable, (err) => {
        if (err) {
            console.error('❌ Error creating ai_insights table:', err);
            process.exit(1);
        }
        console.log('✅ ai_insights table created successfully');
        console.log('\n🎉 Database setup complete!');
        console.log('\nYou can now use the AI Expense Prediction feature.');
        process.exit(0);
    });
});
