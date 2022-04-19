const mongoose = require("mongoose");
const { Profile, Male, Female } = require("../models/user.model");

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