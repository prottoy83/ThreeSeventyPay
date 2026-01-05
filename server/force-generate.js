// DIRECT TEST - Force generate predictions for user 1
const db = require('./config/db');

console.log('🔧 DIRECT PREDICTION TEST\n');

// Step 1: Check transactions
console.log('Step 1: Checking transactions for user 1...');
db.query("SELECT COUNT(*) as count FROM transaction_record WHERE sender_id = '1'", (err, result) => {
    if (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }

    const count = result[0].count;
    console.log(`   Found ${count} transactions\n`);

    if (count === 0) {
        console.log('❌ No transactions found!');
        console.log('   Make a transaction through the app first.');
        process.exit(1);
    }

    // Step 2: Check if tables exist
    console.log('Step 2: Checking ai_prediction table...');
    db.query("SHOW TABLES LIKE 'ai_prediction'", (err, result) => {
        if (err || result.length === 0) {
            console.error('❌ Table ai_prediction does not exist!');
            console.log('   Run: node setup-ai-tables.js');
            process.exit(1);
        }

        console.log('✅ Table exists\n');

        // Step 3: Import and call the function
        console.log('Step 3: Importing prediction module...');
        try {
            const predictionModule = require('./modules/expensePrediction');

            if (typeof predictionModule.generatePredictionsForUser !== 'function') {
                console.error('❌ Function not found!');
                console.log('   Available:', Object.keys(predictionModule));
                process.exit(1);
            }

            console.log('✅ Module loaded\n');

            // Step 4: Generate predictions
            console.log('Step 4: Generating predictions for user 1...\n');
            predictionModule.generatePredictionsForUser('1', (err, result) => {
                if (err) {
                    console.error('❌ Generation failed:', err);
                    process.exit(1);
                }

                console.log('\n✅ GENERATION COMPLETE!\n');
                console.log('Result:', JSON.stringify(result, null, 2));

                // Step 5: Verify in database
                console.log('\nStep 5: Checking database...');
                db.query("SELECT * FROM ai_prediction WHERE user_id = '1'", (err, preds) => {
                    if (err) {
                        console.error('❌ Error checking database:', err);
                        process.exit(1);
                    }

                    console.log(`   Found ${preds.length} predictions in database\n`);

                    if (preds.length > 0) {
                        console.log('📊 Stored Predictions:');
                        preds.forEach(p => {
                            console.log(`   ${p.category}: $${p.predicted_amount} (${p.confidence}% confidence)`);
                        });
                        console.log('\n🎉 SUCCESS! Predictions are stored!');
                        console.log('   Now refresh your dashboard.');
                    } else {
                        console.log('⚠️  Predictions generated but NOT stored in database');
                        console.log('   Check the console output above for errors.');
                    }

                    process.exit(0);
                });
            });

        } catch (error) {
            console.error('❌ Error loading module:', error.message);
            console.error(error);
            process.exit(1);
        }
    });
});
