const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  gender: String,
  age: Number,
  location: String,
  ginterests: String,
  interests: Array
});

const mlSchema = new mongoose.Schema({
  name: String,
  username: String,
  password: String,
  gender: String,
  age: Number,
  location: String,
  ginterests: String,
  interests: Array
});

module.exports.Profile = mongoose.model("Profile", userSchema);
module.exports.Male = mongoose.model("Male", mlSchema);