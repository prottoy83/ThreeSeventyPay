const express = require('express');
const cors = require('cors')
const app = express()
const port = 5990


require('./config/db')
app.use(cors())
app.use(express.json());
app.get('/', (req, res) => {
    res.send('ThreeSeventyProject')
})

const userAuthRoutes = require('./modules/userAuth');
app.use("/auth/", userAuthRoutes);

const userPaymentMethods = require('./modules/paymentMethod');
app.use("/payMethods/", userPaymentMethods);

const paymentLinks = require('./modules/paymentLink');
app.use("/paylinks/", paymentLinks);

const referralRoutes = require('./modules/referral');
app.use("/referrals/", referralRoutes);

const currencyRoutes = require('./modules/currency');
app.use("/currency/", currencyRoutes);

const transactionRoutes = require('./modules/transaction');
app.use("/transactions/", transactionRoutes);

const expensePredictionRoutes = require('./modules/expensePrediction');
app.use("/predictions/", expensePredictionRoutes);

app.listen(port, () => {
    console.log(`Running on port ${port}`)
})