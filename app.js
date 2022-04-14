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
const cors = require('cors');
const path = require('path');
const uuid = require('uuid').v4;
const multer = require('multer');
const Aws = require('aws-sdk');
const multerS3 = require("multer-s3");



const app = express();



app.use(express.urlencoded({extended: true}));
app.use(cors(), express.json());

app.use(express.static("public"));

app.set("view engine", "ejs");

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());

app.use(passport.session());

const s3 = new Aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.S3_BUCKET_REGION,
  });

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const pSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
    interests: Array,
    gender: String,
    age: Number,
    location: String,
    gInterests: String,
    pict: String,
    bio: String
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
    gInterests: String,
    pict: String,
    pics: String,
    bio: String
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
    gInterests: String,
    pict: String,
    pics: String,
    bio: String
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



const upload = multer({
    storage: multerS3({
        s3,
        acl: 'public-read',
        bucket: 'datingappimages',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${uuid()}${ext}`);
        }
    })
});





app.get("/dashboard", async (req, res) => {
    const profUinfo = await Profile.findById(req.user.id);

    const profpz = [];
    const mainPic = [];
    if(profUinfo.gender == "male"){
        const minfz = await Mprofile.findById(req.user.id).exec();
        mainPic.push(minfz.pict);
        minfz.pics.forEach(function(imgs){
            profpz.push(imgs);
        });

    } else {
        const winfz = await Wprofile.findById(req.user.id).exec();
        mainPic.push(winfz.pict);
        winfz.pics.forEach(function(itmz){
            profpz.push(itmz)
        });
    }

        res.render("dashboard", {userNm: profUinfo.name, usergn: profUinfo.gender, userAge: profUinfo.age, userLoc: profUinfo.location, userGi: profUinfo.ginterests, userPcs: mainPic[0], allPcs: profpz, userAtr: profUinfo.interests});

    
});










app.post("/interests", async (req, res) => {
    const userInrz = [];
    for(let name in req.body) {
        if (req.body.hasOwnProperty(name)) {
            userInrz.push(req.body[name]);
        }
    }
    
    const updPf = await Profile.findOneAndUpdate({_id: req.user.id}, {$push: {interests: userInrz.toString()}}).exec();
    if(updPf.gender == "male"){
        await Mprofile.findOneAndUpdate({_id: req.user.id}, {$push: {interests: userInrz.toString()}}).exec();
    } else {
        await Wprofile.findOneAndUpdate({_id: req.user.id}, {$push: {interests: userInrz.toString()}}).exec();
    }
    res.redirect("/dashboard");



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
                    gInterests: genInter
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
                Profile.find({username: req.body.username}, function(err, results){
                    if(results[0].gender == "male"){
                        res.redirect("/male");
                    } else {
                        res.redirect("/female");
                    }
                });
               
            });
        }
    });
});




app.get("/", function(req, res){
    res.render("register");
});

app.get("/interests", function(req, res){
    res.render("interests");
});

app.listen(3000, function(){
    console.log("Server started successfully");
});



// app.post("/interests", function(req, res){
//     Profile.findOneAndUpdate({_id: req.user.id}, {$push: {interests: [req.body]}}, function(err, resultz){
//         Mprofile.findOneAndUpdate({_id: req.user.id}, {$push: {interests: [req.body]}}, function(err, results){
//             if(results){
//                 res.redirect("/dashboard");
//             } else {
//                 Wprofile.findOneAndUpdate({_id: req.user.id}, {$push: {interests: [req.body]}}, function(err, result){
//                     if(err){
//                         console.log(err);
//                     } else {
//                         res.redirect("/dashboard");
//                     }

//                 });
//             }
//         });

        
//     });
// });


// app.get("/dashboard", function(req, res){

//     Profile.findById(req.user.id, function(err, results){
        
//         const userIntrs = [];
//         for(let name in results.interests[0][0]) {
//             if (results.interests[0][0].hasOwnProperty(name)) {
//                 userIntrs.push(results.interests[0][0][name]);
//             }
//         }
//         res.render("dashboard", {userNm: results.name, usergn: results.gender, userAge: results.age, userLoc: results.location, userGi: results.gInterests, userAtr: userIntrs.toString()});
//     });
    
// });