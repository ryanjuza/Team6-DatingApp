require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
// const { MongoClient } = require('mongodb');
const ejs = require("ejs");
const axios = require('axios');
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const encrypt = require("mongoose-encryption");
const async = require("async");
const https = require('https');



const app = express();



app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));

app.set("view engine", "ejs");




app.listen(3000, function(){
    console.log("Server started successfully");
});