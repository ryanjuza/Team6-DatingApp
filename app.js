require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const createError = require("http-errors");
const bodyParser= require('body-parser');
// const config = require('./config');
// const env = process.env.NODE_ENV || 'development';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on("error", err => {
    console.log("err", err)
});
  
mongoose.connection.on("connected", () => {
  console.log("mongoose is connected...")
});

mongoose.connection.on("disconnected", () => {
  console.log("mongoose is disconnected...")
});

const usersRouter = require("./routes/user.route");

app.use("/api/profiles", usersRouter);

app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;