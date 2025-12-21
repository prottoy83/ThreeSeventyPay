const db = require('mysql')

const pool = db.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ThreeSeventyPay',
})

pool.connect((e) => {
    if(e)
    {
        console.log(`Error: ${e.message}`)
    }
    else{
        console.log(`Database Connected`)
    }
})

module.exports = pool;