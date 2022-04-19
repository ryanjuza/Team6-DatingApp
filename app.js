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




app.post("/bio", async (req, res) => {
    const chkgn = await Profile.findById(req.user.id).exec();
    if(chkgn.gender == "male"){
        await Mprofile.updateOne({_id: req.user.id}, {$set: {bio: req.body.bios}}).exec();
    } else {
        await Wprofile.updateOne({_id: req.user.id}, {$set: {bio: req.body.bios}}).exec();
    }
    await Profile.updateOne({_id: req.user.id}, {$set: {bio: req.body.bios}}).exec();
    res.redirect("/dashboard");
});


app.post("/rmvpic", async (req, res) => {
    const chkgdr = await Profile.findById(req.user.id).exec();
    if(chkgdr.gender == "male"){
        await Mprofile.findOneAndUpdate({_id: req.user.id}, {$pull: {pics: req.body.btimg}}).exec();

    } else {
        await Wprofile.findOneAndUpdate({_id: req.user.id}, {$pull: {pics: req.body.btimg}}).exec();
    }
    res.redirect("/dashboard");
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

        res.render("dashboard", {userNm: profUinfo.name, usergn: profUinfo.gender, userAge: profUinfo.age, userLoc: profUinfo.location, userGi: profUinfo.gInterests, userPcs: mainPic[0], allPcs: profpz, userAtr: profUinfo.interests});

    
});




app.get("/male", async (req, res) => {
    const findHisLikes = await Like.findById(req.user.id).exec();
    const filterProf = [];
    findHisLikes.women.forEach(function(reslt){
        filterProf.push(reslt.wid);
    });

    const getWpro = await Wprofile.find({'_id': {$nin: filterProf}}).limit(1).exec();
    

    res.render('male', {herInfos: getWpro});

});


app.get("/female", async (req, res) => {

    const findHerLikes = await Flike.findById(req.user.id).exec();

    const filterMprof = [];
    findHerLikes.men.forEach(function(reslt){
        filterMprof.push(reslt.mid);
    });

    const getMpro = await Mprofile.find({'_id': {$nin: filterMprof}}).limit(1).exec();

    res.render("female", {hisInfos: getMpro});
});



app.post("/matchm", async (req, res) => {
    const checkA = await Profile.findById(req.user.id).exec();
    if(checkA.gender == "male"){
        res.redirect("/mcards");
    } else {
        res.redirect("/wcards");
    }
});


app.post("/cards", async (req, res) => {

    const vldgn = await Profile.findById(req.user.id).exec();
    if(vldgn.gender == "male"){
        res.redirect("/male");
    } else {
        res.redirect("/female");
    }
});


app.post('/upimg', upload.single('imagez'), async (req, res) => {
    const uploadedFile = req.file.location;

    // const addProfPic = await Profile.updateOne({_id: req.user.id}, { $set: { pict: uploadedFile}},{upsert:true});
    const checkGender = await Profile.findById(req.user.id).exec();
    if(checkGender.gender == "male"){
        await Mprofile.updateOne({_id: req.user.id}, { $set: { pict: uploadedFile}},{upsert:true}).exec();
    } else {
        await Wprofile.updateOne({_id: req.user.id}, { $set: { pict: uploadedFile}},{upsert:true}).exec();
    }
    
    res.redirect("/dasboard");
});


app.post('/userpics', upload.single('userImg'), async (req, res) => {
    const uploadedFiles = req.file.location;

    const checkGenderz = await Profile.findById(req.user.id).exec();
    if(checkGenderz.gender == "male"){
        await Menp.findOneAndUpdate({_id: req.user.id}, {$push: {pics: uploadedFiles}}).exec();
    } else {
        await Womenp.findOneAndUpdate({_id: req.user.id}, {$push: {pics: uploadedFiles}}).exec();
    }
    res.redirect("/dashboard");
});


app.post("/wlikes", async (req, res) => {
    const getZan = await Wprofile.findById(req.user.id);
    const getMard = await Mprofile.findById(req.body.addT);
    const femaleAt = getZan.interests[0].split(',');
    const maleAt = getMard.interests[0].split(',');
            
            const common_ats = femaleAt.filter(x => maleAt.indexOf(x) !== -1);
            if(common_ats.length > 3){
                // let menMatchd = new Mlmatch({
                //     mid: req.body.addT,
                //     wid: req.user.id
                // });
                // menMatchd.save();
                const mForW = await Like.findOneAndUpdate({_id: req.body.addT}, {$push: {women: [{wid: req.user.id, seen: "N", rate: common_ats.length}]}});
            }
            const zanLikes = await Flike.findOneAndUpdate({_id: req.user.id}, {$push: {men: [{mid: req.body.addT, seen: "N", rate: common_ats.length}]}});
            res.redirect("/female");
});


app.post("/z", async (req, res) => {
    const getMards = await Mprofile.findById(req.user.id);
    const getZans = await Wprofile.findById(req.body.addT);
    const mattrs = getMards.interests[0].split(',');
    const wattrs = getZans.interests[0].split(',');

            const common_atrs = mattrs.filter(x => wattrs.indexOf(x) !== -1);
            if(common_atrs.length > 3){
                // let femMatchd = new Womatch({
                //     wid: req.body.addT,
                //     mid: req.user.id
                // });
                // femMatchd.save();
                const mforM = await Flike.findOneAndUpdate({_id: req.body.addT}, {$push: {men: [{mid: req.user.id, seen: "N", rate: common_atrs.length}]}});
            }

            const mardLikez = await Like.findOneAndUpdate({_id: req.user.id}, {$push: {women: [{wid: req.body.addT, seen: "N", rate: common_atrs.length}]}});
            res.redirect("/male");
});


app.post("/dislike", async (req, res) => {
    const mdsl = await Like.findOneAndUpdate({_id: req.user.id}, {$push: {women: [{wid: req.body.rejc, seen: "N", rate: 0}]}});
    const mwdsl = await Flike.findOneAndUpdate({_id: req.body.rejc}, {$push: {men: [{mid: req.user.id, seen: "N", rate: 0}]}});
    res.redirect("/male");
});

app.post("/wdislike", async (req, res) => {
    const wdsl = await Flike.findOneAndUpdate({_id: req.user.id}, {$push: {men: [{mid: req.body.wrejc, seen: "N", rate: 0}]}});
    const wmdsl = await Like.findOneAndUpdate({_id: req.body.wrejc}, {$push: {women: [{wid: req.user.id, seen: "N", rate: 0}]}});
    res.redirect("/female");
});


app.post("/delete", async (req, res) => {
    const chkg = await Profile.findById(req.user.id).exec();
    if(chkg.gender == "male"){
        await Mprofile.findByIdAndDelete(req.user.id).exec();
    } else {
        await Wprofile.findByIdAndDelete(req.user.id).exec();
    }
    res.redirect("/");
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


app.get("/mcards", async (req, res) => {
    const findHisLikess = await Like.findById(req.user.id).exec();
    
    const addLowRates = [];
    const addHighRates = [];
    findHisLikess.women.forEach(function(zan){
        if(zan.rate >= 3){
            addHighRates.push(zan.wid);
        } 
        if(zan.rate <= 3 && zan.rate > 0) {
            addLowRates.push(zan.wid);
        }
    });
    const filterProfs = [];
    findHisLikess.women.forEach(function(reslt){
        filterProfs.push(reslt.wid);
    });
    
    
    const lwRates = await Flike.find({'_id': {$in: addLowRates}}).exec();
    // console.log(lwRate);

    const addLfzs = [];
    
        lwRates.forEach(function(results){
            results.men.forEach(function(item){
                if(item.mid == req.user.id){
                    addLfzs.push(results._id);
                }
            });

        });

    const arrayzs = addLfzs.concat(addHighRates);
    const getMatchInfoss = await Wprofile.find({'_id': {$in: arrayzs}}).exec();
    
    
    res.render('mcards', {matchInf: getMatchInfoss});


    // res.render('mcards');
});



app.get("/wcards", async (req, res) => {


    const findHerLikess = await Flike.findById(req.user.id).exec();

    const addLmRates = [];
    const addHmRates = [];
    findHerLikess.men.forEach(function(mard){
        if(mard.rate >= 3){
            addHmRates.push(mard.mid);
        } 
        if(mard.rate <= 3 && mard.rate > 0) {
            addLmRates.push(mard.mid);
        }
    });

    const filterMprofs = [];
    findHerLikess.men.forEach(function(reslt){
        filterMprofs.push(reslt.mid);
    });

    const lmRates = await Like.find({'_id': {$in: addLmRates}});
    // console.log(lmRate);

    const addLmzs = [];
    
        lmRates.forEach(function(results){
            results.women.forEach(function(item){
                if(item.wid == req.user.id){
                    addLmzs.push(results._id);
                }
            });

        });
    const arrayzms = addLmzs.concat(addHmRates);

    const getMatchInfoms = await Mprofile.find({'_id': {$in: arrayzms}}).exec();

    res.render("wcards", {matchInf: getMatchInfoms});
});




app.post("/register", function(req, res){
    const fn = req.body.fname;
    const gn = req.body.gender;
    const age = req.body.age;
    const genInter = req.body.ginter;
    const un = req.body.username;
    const loc = req.body.location;


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

app.get("/test", (req, res) =>  {
    res.status(200).send("Hello world");
  });


app.get("/", function(req, res){
    res.render("register");
});

app.post("/logout", function(req, res){
    req.logout();
    res.redirect("/registerz");

});

app.get("/interests", function(req, res){
    res.render("interests");
});

app.listen(3000, function(){
    console.log("Server started successfully");
});

module.exports = app;

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