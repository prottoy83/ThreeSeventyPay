-- Create AI Prediction Table
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
);

-- Create AI Insights Table
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
);
