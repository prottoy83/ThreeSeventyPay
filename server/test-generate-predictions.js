const db = require('./config/db');
const { generatePredictionsForUser } = require('./modules/expensePrediction');

// Get user ID from command line argument
const uid = process.argv[2];

if (!uid) {
    console.error('❌ Please provide a user ID');
    console.log('Usage: node test-generate-predictions.js YOUR_UID');
    process.exit(1);
}

console.log(`🔧 Testing prediction generation for user: ${uid}\n`);

// Step 1: Check if tables exist
console.log('Step 1: Checking if ai_prediction table exists...');
db.query("SHOW TABLES LIKE 'ai_prediction'", (err, results) => {
    if (err) {
        console.error('❌ Database error:', err);
        process.exit(1);
    }

    if (results.length === 0) {
        console.error('❌ Table ai_prediction does not exist!');
        console.log('   Run: node setup-ai-tables.js');
        process.exit(1);
    }

    console.log('✅ Table ai_prediction exists\n');

    // Step 2: Check transaction count
    console.log('Step 2: Checking transaction count...');
    const txQuery = `
        SELECT COUNT(*) as count 
        FROM transaction_record 
        WHERE sender_id = ? 
        AND transaction_type IN ('PAYMENT', 'TRANSFER', 'ADD_MONEY')
    `;

    db.query(txQuery, [uid], (err, results) => {
        if (err) {
            console.error('❌ Error checking transactions:', err);
            process.exit(1);
        }

        const txCount = results[0].count;
        console.log(`   Found ${txCount} transactions`);

        if (txCount === 0) {
            console.log('❌ No transactions found for this user');
            console.log('   Make some transactions first!');
            process.exit(1);
        }

        console.log('✅ User has transaction data\n');

        // Step 3: Generate predictions
        console.log('Step 3: Generating predictions...');
        generatePredictionsForUser(uid, (err, result) => {
            if (err) {
                console.error('❌ Prediction generation failed:', err);
                process.exit(1);
            }

            console.log('\n✅ Prediction generation completed!');
            console.log('\nResult:');
            console.log(JSON.stringify(result, null, 2));

            // Step 4: Check if predictions were stored
            console.log('\nStep 4: Checking stored predictions...');
            db.query('SELECT COUNT(*) as count FROM ai_prediction WHERE user_id = ?', [uid], (err, results) => {
                if (err) {
                    console.error('❌ Error checking stored predictions:', err);
                    process.exit(1);
                }

                const predCount = results[0].count;
                console.log(`   Found ${predCount} predictions in database`);

                if (predCount > 0) {
                    console.log('\n🎉 SUCCESS! Predictions generated and stored!');

                    // Show the predictions
                    db.query('SELECT * FROM ai_prediction WHERE user_id = ? ORDER BY predicted_amount DESC', [uid], (err, preds) => {
                        if (!err && preds.length > 0) {
                            console.log('\nStored Predictions:');
                            preds.forEach(p => {
                                console.log(`   ${p.category}: $${p.predicted_amount} (confidence: ${p.confidence}%)`);
                            });
                        }
                        process.exit(0);
                    });
                } else {
                    console.log('\n⚠️  Predictions generated but not stored in database');
                    console.log('   Check server logs for errors');
                    process.exit(1);
                }
            });
        });
    });
});
