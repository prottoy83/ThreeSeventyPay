const db = require('./config/db');

console.log('🔧 FIXING AI Prediction table structure...\\n');

// Step 1: Drop old table
console.log('Step 1: Dropping old ai_prediction table...');
db.query('DROP TABLE IF EXISTS ai_prediction', (err) => {
    if (err) {
        console.error('❌ Error dropping table:', err);
        process.exit(1);
    }
    console.log('✅ Old table dropped\\n');

    // Step 2: Create new table with correct structure
    console.log('Step 2: Creating new ai_prediction table with correct columns...');
    const createPredictionTable = `
    CREATE TABLE ai_prediction (
        prediction_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
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

    db.query(createPredictionTable, (err) => {
        if (err) {
            console.error('❌ Error creating table:', err);
            process.exit(1);
        }
        console.log('✅ New table created successfully\\n');

        // Step 3: Verify columns
        console.log('Step 3: Verifying table structure...');
        db.query('DESCRIBE ai_prediction', (err, columns) => {
            if (err) {
                console.error('❌ Error checking table:', err);
                process.exit(1);
            }

            console.log('\\n📋 Table Columns:');
            columns.forEach(col => {
                console.log(`   - ${col.Field} (${col.Type})`);
            });

            console.log('\\n🎉 Table structure fixed!');
            console.log('\\nNow run: node force-generate.js');
            process.exit(0);
        });
    });
});
