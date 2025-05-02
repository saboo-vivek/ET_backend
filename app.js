require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const app = express();

const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expense");
const purchaseRoutes = require("./routes/purchase");
const premiumRoutes = require("./routes/premium");
const passwordRoute = require("./routes/password");

const accesslogstream = fs.createWriteStream(
   path.join(__dirname, "access.log"),
   { flag: "a" }
);

app.use(cors());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("combined", { stream: accesslogstream }));
app.use(express.json());

app.use(authRoutes);
app.use(expenseRoutes);
app.use(purchaseRoutes);
app.use(premiumRoutes);
app.use(passwordRoute);

const User = require("./models/user");
const Expense = require("./models/expense");
const Order = require("./models/order");
const ForGotPassword = require("./models/forgotpassword");

mongoose
   .connect(process.env.MONGO_URL)
   .then(() => {
      app.listen(process.env.BACKEND_PORT, () => {
         console.log(`Connected to MongoDB on port ${process.env.BACKEND_PORT}`);
      });
   })
   .catch((error) => {
      console.log('Error while connecting: ', error.message);
   });
