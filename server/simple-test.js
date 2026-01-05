// Simple test to check if prediction generation works
const db = require('./config/db');

console.log('Testing prediction module import...\n');

try {
    const predictionModule = require('./modules/expensePrediction');
    console.log('✅ Module imported successfully');
    console.log('   Type:', typeof predictionModule);
    console.log('   Has generatePredictionsForUser?', typeof predictionModule.generatePredictionsForUser);

    if (typeof predictionModule.generatePredictionsForUser === 'function') {
        console.log('\n✅ Function is available!\n');

        // Get UID from command line
        const uid = process.argv[2];
        if (!uid) {
            console.log('Usage: node simple-test.js YOUR_UID');
            process.exit(0);
        }

        console.log(`Calling generatePredictionsForUser for ${uid}...\n`);

        predictionModule.generatePredictionsForUser(uid, (err, result) => {
            if (err) {
                console.error('❌ Error:', err.message || err);
                process.exit(1);
            }

            console.log('✅ Success!');
            console.log('\nResult:', JSON.stringify(result, null, 2));
            process.exit(0);
        });
    } else {
        console.log('❌ Function not found on module');
        console.log('   Available properties:', Object.keys(predictionModule));
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Error importing module:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
}
