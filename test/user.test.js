require('dotenv').config();
const expect = require("chai").expect;
const request = require("supertest");
const { Profile, Male } = require("../models/user.model");
const app = require("../app");
const mongoose = require('mongoose');
// const config = require('../config');
// const env = process.env.NODE_ENV || 'development';

let userId = '';

describe("api/profiles", () => {
  before(async () => {
    await Profile.deleteMany({});
  });

  after(async () => {
    mongoose.disconnect();
  });

  it("should connect and disconnect to mongodb", async () => {
      // console.log(mongoose.connection.states);
      mongoose.disconnect();
      mongoose.connection.on('disconnected', () => {
        expect(mongoose.connection.readyState).to.equal(0);
      });
      mongoose.connection.on('connected', () => {
        expect(mongoose.connection.readyState).to.equal(1);
      });
      mongoose.connection.on('error', () => {
        expect(mongoose.connection.readyState).to.equal(99);
      });

      await mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});
  });

  describe("GET /", () => {
    it("should return all users", async () => {
      const users = [
        { name: "george", username: "geo@gmail.com", password: "123", gender: "male", age: 23, location: "georgia", ginterests: "female" },
        { name: "reza", username: "rez@gmail.com", password: "123", gender: "female", age: 23, location: "georgia", ginterests: "female" }
      ];
      await Profile.insertMany(users);
      const res = await request(app).get("/api/profiles");
      expect(res.status).to.equal(200);
      expect(res.body.length).to.equal(2);
    });
  });

  describe("GET /:id", () => {
    it("should return a user if valid id is passed", async () => {
      const user = new Profile({
        name: "james",
        username: "james@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female"
      });
      await user.save();
      const res = await request(app).get("/api/profiles/" + user._id);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("name", user.name);
    });

    it("should return 400 error when invalid object id is passed", async () => {
      const res = await request(app).get("/api/profiles/1");
      expect(res.status).to.equal(400);
    });

    it("should return 404 error when valid object id is passed but does not exist", async () => {
      const res = await request(app).get("/api/profiles/5f43ef20c1d4a133e4628181");
      expect(res.status).to.equal(404);
    });
  });

  describe("POST /", () => {
    it("should create and return new user when the all request body is valid", async () => {
      const res = await request(app)
        .post("/api/profiles")
        .send({
          name: "jack",
          username: "jack@gmail.com",
          password: "123",
          gender: "male",
          age: 23,
          location: "georgia",
          ginterests: "female"
        });
      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("_id");
      expect(data).to.have.property("name", "jack");
      expect(data).to.have.property("username", "jack@gmail.com");
      expect(data).to.have.property("password", "123");
      expect(data).to.have.property("gender", "male");
      expect(data).to.have.property("age", 23);
      expect(data).to.have.property("location", "georgia");
      expect(data).to.have.property("ginterests", "female");

      const user = await Male.findOne({ username: 'jack@gmail.com' });
      expect(user.name).to.equal('jack');
      expect(user.username).to.equal('jack@gmail.com');
    });
  });

  describe("PUT /:id", () => {
    it("should update the existing user and return 200", async() => {
        const user = new Profile({
          name: "ryan",
          username: "ry@gmail.com",
          password: "123",
          gender: "male",
          age: 23,
          location: "georgia",
          ginterests: "female"
        });
        await user.save();

        const res = await request(app)
            .put("/api/profiles/" + user._id)
            .send({
              name: "ry",
              username: "fry@gmail.com",
              password: "344",
              gender: "male",
              age: 23,
              location: "california",
              ginterests: "female"
            });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("name", "ry");
      expect(res.body).to.have.property("password", "344");
      expect(res.body).to.have.property("location", "california");
    });

    it("should return 400 error when invalid object id is passed", async () => {
      const res = await request(app).get("/api/profiles/1");
      expect(res.status).to.equal(400);
    });

  });

  describe("DELETE /:id", () => {
    it("should delete user using id and return response 200", async () => {
      const user = new Profile({
        name: "mehrad",
        username: "mehrad@gmail.com",
        password: "344",
        gender: "male",
        age: 23,
        location: "california",
        ginterests: "female"
      });
      await user.save();
      userId = user._id;
      const res = await request(app).delete("/api/profiles/" + userId);
      expect(res.status).to.be.equal(200);
    });

    it("should return 404 when deleted user is requested", async () => {
      let res = await request(app).get("/api/profiles/" + userId);
      expect(res.status).to.be.equal(404);
    });
  });
});