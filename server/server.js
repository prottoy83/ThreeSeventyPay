const express = require('express');
const cors = require('cors')
const app = express()
const port = 5990


require('./config/db')
app.use(cors())
app.use(express.json());
app.get('/', (req,res) => {
    res.send('ThreeSeventyProject')
})

const userAuthRoutes = require('./modules/userAuth');
app.use("/auth/", userAuthRoutes);

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})