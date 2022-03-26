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
    interests: Array,
    gender: String,
    age: Number,
    location: String,
    gInterests: String
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
    location: String,
    gInterests: String
});


const Wprofile = mongoose.model('Wprofile', wSchema);






const mSchema = new mongoose.Schema({
    _id: {type: mongoose.Schema.Types.ObjectId, ref: 'pSchema'},
    name: String,
    username: String,
    interests: Array,
    gender: String,
    age: Number,
    location: String,
    gInterests: String
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

app.get("/", function(req, res){
    res.render("register");
});

app.get("/interests", function(req, res){
    res.render("interests");
});



app.post("/register", function(req, res){
    const fn = req.body.fname;
    const gn = req.body.gender;
    const age = req.body.age;
    const genInter = req.body.ginter;
    const un = req.body.username;
    const loc = req.body.location


    Profile.register({username: req.body.username, name: fn, gender: gn, age: age, location: loc, gInterests: genInter}, req.body.password, function(err, profs){
        if (err){
            console.log(err);
        } else {
            const gen = profs._id;
            passport.authenticate("local");
            if (gn == "male"){
                const newMp = new Mprofile({
                    _id: gen,
                    name: fn,
                    username: un,
                    gender: gn,
                    age: age,
                    location: loc,
                    gInterests: genInter
                });
                newMp.save();
                const startLike = new Like({
                    _id: gen
                });
                startLike.save();

            }
            
            if(gn == "female"){
                const newWp = new Wprofile({
                    _id: gen,
                    name: fn,
                    username: un,
                    gender: gn,
                    age: age,
                    location: loc,
                    ginterests: genInter
                });
                newWp.save();
                const startFlike = new Flike({
                    _id: gen
                });
                startFlike.save();
      
            }

            passport.authenticate("local")(req, res, function(){

                res.redirect("/interests");
            });

            
        }
        
        
    });


});


app.post("/logins", function(req, res){
    const newProfs = new Profile({
        username: req.body.username,
        password: req.body.password
    });

    req.login(newProfs, function(err){
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/home");
            });
        }
    });
})

app.listen(3000, function(){
    console.log("Server started successfully");
});