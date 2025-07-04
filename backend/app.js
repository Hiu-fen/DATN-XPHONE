const express = require("express");
const app = express();
const paymentRouter = require('./routes/payment.routes');
const ghnRoutes = require("./routes/ghnRouter");

require("dotenv").config();

app.use(express.json());
app.use('/api/payments', paymentRouter);

app.use("/api/ghn", ghnRoutes);





module.exports = app;
