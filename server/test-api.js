// Test what the API returns
const http = require('http');

const uid = '1'; // Change if your UID is different

console.log('🔍 Testing API endpoint...\n');
console.log(`GET http://localhost:5990/predictions/predictions/${uid}\n`);

const options = {
    hostname: 'localhost',
    port: 5990,
    path: `/predictions/predictions/${uid}`,
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('\nResponse:');
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));

            console.log('\n📊 Analysis:');
            console.log('   Success:', json.success);
            console.log('   Predictions count:', json.predictions?.length || 0);
            console.log('   Total predicted:', json.totalPredicted);
            console.log('   Cached:', json.cached);

            if (json.predictions && json.predictions.length > 0) {
                console.log('\n✅ API is returning predictions!');
                console.log('   The issue is in the frontend.');
                console.log('\n   Check browser console (F12) for errors.');
            } else {
                console.log('\n❌ API is NOT returning predictions.');
                console.log('   The issue is in the backend.');
            }
        } catch (e) {
            console.log('Raw response:', data);
            console.log('\n❌ Invalid JSON response');
        }
    });
});

req.on('error', (e) => {
    console.error('❌ Request failed:', e.message);
    console.log('\nIs the server running on port 5990?');
});

req.end();
