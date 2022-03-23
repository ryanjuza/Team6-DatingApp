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

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());

app.use(passport.session());



mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const pSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    gender: String
});

pSchema.plugin(passportLocalMongoose);

const Profile = mongoose.model('Profile', pSchema);

passport.use(Profile.createStrategy());

passport.serializeUser(Profile.serializeUser());
passport.deserializeUser(Profile.deserializeUser());



const wSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, ref: 'pSchema'},
    name: String,
    username: String,
    interests: Array,
    gender: String,
    age: Number,
    location: String
});


const Wprofile = mongoose.model('Wprofile', wSchema);






const mSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, ref: 'pSchema'},
    name: String,
    username: String,
    interests: Array,
    gender: String,
    age: Number,
    location: String
});



const Mprofile = mongoose.model('Mprofile', mSchema);








const mlikeSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, ref: 'mSchema'},
    women: [{wid: {type: mongoose.Schema.Types.ObjectId, ref: 'wSchema'}, seen: String, rate: Number}]
});


const Like = mongoose.model('Like', mlikeSchema);




// ************ //

const wlikeSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, ref: 'wSchema'},
    men: [{mid: {type: mongoose.Schema.Types.ObjectId, ref: 'mSchema'}, seen: String, rate: Number}]
});


const Flike = mongoose.model('Flike', wlikeSchema);

const mchSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, ref: 'mSchema'},
    women: [{wid: {type: mongoose.Schema.Types.ObjectId, ref: 'wSchema'}, seen: String, rate: Number}]
});




app.listen(3000, function(){
    console.log("Server started successfully");
});