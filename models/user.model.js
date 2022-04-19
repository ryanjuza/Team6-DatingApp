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

module.exports.Profile = mongoose.model("Profile", userSchema);
module.exports.Male = mongoose.model("Male", mlSchema);
module.exports.Female = mongoose.model("Female", wlSchema);