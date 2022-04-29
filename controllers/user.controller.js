const mongoose = require("mongoose");
const { Profile, Male, Female, Malike, Wolike } = require("../models/user.model");

module.exports.getAllUsers = async (req, res) => {
  let users = await Profile.find({});
  return res.send(users);
};

module.exports.getUser = async (req, res) => {
  let userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).send("Invalid object id");
  let user = await Profile.findById(userId);
  if (!user) return res.status(404).send("User not found");
  return res.send(user);
};

module.exports.createUser = async (req, res) => {
  let user = new Profile({
    name: req.body.name,
    username: req.body.username,
    password: req.body.password,
    gender: req.body.gender,
    age: req.body.age,
    location: req.body.location,
    ginterests: req.body.ginterests
  });
  await user.save();
  if(user.gender == "male"){
    let userMale = new Male({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password,
      gender: req.body.gender,
      age: req.body.age,
      location: req.body.location,
      ginterests: req.body.ginterests
    });
    await userMale.save();
  }
  return res.send(user);
};

module.exports.updateUser = async (req, res) => {
  let userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).send("Invalid object id");
  Profile.findByIdAndUpdate(userId, req.body, { new: true })
    .then(user => {
      return res.send(user);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
};

module.exports.deleteUser = async (req, res) => {
  let userId = req.params.id;
  await Profile.findByIdAndRemove(userId);
  return res.send("User deleted");
};



module.exports.getUserInfo = async (req, res) => {
  let userId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId))
    return res.status(400).send("Invalid object id");
  let user = await Profile.findById(userId);
  if (!user) return res.status(404).send("User not found");
  return res.send(user);
};


module.exports.addAtrr = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid object id");
  const updPf = await Profile.findOneAndUpdate({_id: req.params.id}, {$push: {interests: req.body.adventure}}).exec();
  if(updPf.gender == "male"){
      var maleUser = await Male.findOneAndUpdate({_id: req.params.id}, {$push: {interests: req.body.adventure}}).exec();
      return res.send(maleUser);
  }
  else if(updPf.gender == "female") {
    var femaleUser = await Female.findOneAndUpdate({_id: req.params.id}, {$push: {interests: req.body.adventure}}).exec();
    return res.send(femaleUser);
  }
  // res.redirect("/home");

 
};


module.exports.addBio = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid object id");
  const updPf = await Profile.findOneAndUpdate({_id: req.params.id}, {$set: {bio: req.body.bio}}).exec();
  if(updPf.gender == "male"){
      var maleUser = await Male.findOneAndUpdate({_id: req.params.id}, {$set: {bio: req.body.bio}}).exec();
      return res.send(maleUser);
  }
  else if(updPf.gender == "female") {
    var femaleUser = await Female.findOneAndUpdate({_id: req.params.id}, {$set: {bio: req.body.bio}}).exec();
    return res.send(femaleUser);
  }
  
 
};

module.exports.addMatch = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.body.mid))
    return res.status(400).send("Invalid object id");
  const getMards = await Male.findById(req.body.mid);
  const getZans = await Female.findById(req.body.wid);
  const mattrs = getMards.interests;
  const wattrs = getZans.interests;

  const common_atrs = mattrs.filter(x => wattrs.indexOf(x) !== -1);
  if(common_atrs.length > 3){
    const mforM = await Wolike.findOneAndUpdate({_id: req.body.wid}, {$push: {men: [{mid: req.body.mid, seen: "N", rate: common_atrs.length}]}});
  }

    const mardLikez = await Malike.findOneAndUpdate({_id: req.body.mid}, {$push: {women: [{wid: req.body.wid, seen: "N", rate: common_atrs.length}]}});

    if(common_atrs.length < 3){
      return res.send({emsg: "not Match"});
    }
    else if(common_atrs.length > 3){
      return res.send({msg: "Match"});
    }
    
  
 
};

module.exports.noMatch = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.body.mid))
    return res.status(400).send("Invalid object id");
  const mdsl = await Malike.findOneAndUpdate({_id: req.body.mid}, {$push: {women: [{wid: req.body.wid, seen: "N", rate: 0}]}});
  const mwdsl = await Wolike.findOneAndUpdate({_id: req.body.wid}, {$push: {men: [{mid: req.body.mid, seen: "N", rate: 0}]}});

  return res.send({rate: "0"});
    
  
 
};



module.exports.getWcards = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.body.mid))
    return res.status(400).send("Invalid object id");
  const findHisLikes = await Malike.findById(req.body.mid).exec();
  const filterProf = [];
  findHisLikes.women.forEach(function(reslt){
      filterProf.push(reslt.wid);
  });

  const getWpro = await Female.find({'_id': {$nin: filterProf}}).limit(1).exec();
  

  return res.send({msg: "Done"});
    
  
 
};



module.exports.getMcards = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.body.wid))
    return res.status(400).send("Invalid object id");
  const findHerLikes = await Wolike.findById(req.body.wid).exec();
  const filterProfs = [];
  findHerLikes.men.forEach(function(reslt){
      filterProfs.push(reslt.mid);
  });

  const getWpros = await Male.find({'_id': {$nin: filterProfs}}).limit(1).exec();
  

  return res.send({msg: "Done"});
    
  
 
};


module.exports.rmvUser = async (req, res) => {

  if (!mongoose.Types.ObjectId.isValid(req.body.uid))
    return res.status(400).send("Invalid object id");

    const chkg = await Profile.findById(req.body.uid).exec();
    if(chkg.gender == "male"){
        await Male.findByIdAndDelete(req.body.uid).exec();
    } else {
        await Female.findByIdAndDelete(req.body.uid).exec();
    } 
  

  return res.send({msg: "Done"});
    
  
 
};