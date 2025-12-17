const express = require('express');
const app = express()
const port = 5990

app.get('/', (req,res) => {
    res.send('ThreeSeventyProject')
})

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})