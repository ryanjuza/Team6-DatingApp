const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  gender: String,
  age: Number,
  location: String,
  ginterests: String,
  interests: Array,
  bio: String
});

const mlSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  gender: String,
  age: Number,
  location: String,
  ginterests: String,
  interests: Array,
  bio: String
});


const wlSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  gender: String,
  age: Number,
  location: String,
  ginterests: String,
  interests: Array,
  bio: String
});


const mlkSchema = new mongoose.Schema({
  _id: {type: mongoose.Schema.Types.ObjectId, ref: 'mlSchema'},
  women: [{wid: {type: mongoose.Schema.Types.ObjectId, ref: 'wlSchema'}, seen: String, rate: Number}]
});



const wlkSchema = new mongoose.Schema({
  _id: {type: mongoose.Schema.Types.ObjectId, ref: 'wlSchema'},
  men: [{mid: {type: mongoose.Schema.Types.ObjectId, ref: 'mlSchema'}, seen: String, rate: Number}]
});





module.exports.Profile = mongoose.model("Profile", userSchema);
module.exports.Male = mongoose.model("Male", mlSchema);
module.exports.Female = mongoose.model("Female", wlSchema);
module.exports.Malike = mongoose.model('Malike', mlkSchema);
module.exports.Wolike = mongoose.model('Wolike', wlkSchema);