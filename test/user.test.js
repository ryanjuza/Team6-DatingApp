require('dotenv').config();
const expect = require("chai").expect;
const request = require("supertest");
const { Profile, Male, Female, Malike, Wolike } = require("../models/user.model");
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
      const res = await request(app).put("/api/profiles/1");
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

  describe("GET /home/:id", () => {
    it("should return a user if valid id is passed", async () => {
      const user = new Profile({
        name: "reza",
        username: "reza@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female"
      });
      await user.save();
      const res = await request(app).get("/api/profiles/home/" + user._id);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("name", user.name);
      expect(res.body).to.have.property("gender", user.gender);
    });

    it("should return 400 error when invalid object id is passed", async () => {
      const res = await request(app).get("/api/profiles/home/1");
      expect(res.status).to.equal(400);
    });

    it("should return 404 error when valid object id is passed but does not exist", async () => {
      const res = await request(app).get("/api/profiles/home/5f43ef20c1d4a133e4628181");
      expect(res.status).to.equal(404);
    });
  });



  describe("POST /userAtrr/:id", () => {
    it("should add user attributes into collection and check if user if male", async () => {
      const user1 = new Profile({
        name: "ebi",
        username: "ebi@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female"
      });
      await user1.save();

      const user2 = new Male({
        _id: user1._id,
        name: "ebi",
        username: "ebi@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female"
      });
      await user2.save();


      const res = await request(app)
        .post("/api/profiles/userAttr/" + user1._id)
        .send({
          adventure: "Clubing"
        });
      const data = res.body;
      
      expect(data).to.have.property("_id");
      expect(data).to.have.property("name", "ebi");

    });

    it("should add user attributes into collection and check if user is female", async () => {
      const user3 = new Profile({
        name: "marry",
        username: "marry@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await user3.save();

      const user4 = new Female({
        _id: user3._id,
        name: "marry",
        username: "marry@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await user4.save();


      const res = await request(app)
        .post("/api/profiles/userAttr/" + user3._id)
        .send({
          adventure: "Clubing"
        });
      const data = res.body;
      
      expect(data).to.have.property("_id");
      expect(data).to.have.property("name", "marry");
      expect(data).to.have.property("gender", "female");

    });

    it("It should give 400 status for invalid Id", async () => {
      const user5 = new Profile({
        name: "Sama",
        username: "Sama@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await user5.save();

      const user6 = new Female({
        _id: user5._id,
        name: "Sama",
        username: "Sama@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await user6.save();


      const res = await request(app)
        .post("/api/profiles/userAttr/12")
        .send({
          adventure: "Clubing"
        });
        expect(res.status).to.equal(400);

    });

  });









  describe("POST /bio/:id", () => {
    it("should add bio into collection and check if user is male", async () => {
      const usera = new Profile({
        name: "alex",
        username: "alex@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female"
      });
      await usera.save();

      const userb = new Male({
        _id: usera._id,
        name: "alex",
        username: "alex@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female"
      });
      await userb.save();


      const res = await request(app)
        .post("/api/profiles/bio/" + usera._id)
        .send({
          bio: "Hello World"
        });
      const data = res.body;
      
      expect(data).to.have.property("_id");
      expect(data).to.have.property("gender", "male");

    });

    it("should add bio into collection and check if user is female", async () => {
      const userc = new Profile({
        name: "lindsey",
        username: "lindsey@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await userc.save();

      const userd = new Female({
        _id: userc._id,
        name: "lindsey",
        username: "lindsey@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await userd.save();


      const res = await request(app)
        .post("/api/profiles/bio/" + userc._id)
        .send({
          bio: "Hello World"
        });
      const data = res.body;
      
      expect(data).to.have.property("_id");
      expect(data).to.have.property("gender", "female");

    });

    it("It should give 400 status for invalid Id", async () => {
      const user55 = new Profile({
        name: "taylor",
        username: "taylor@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await user55.save();

      const user65 = new Female({
        _id: user55._id,
        name: "taylor",
        username: "taylor@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await user65.save();


      const res = await request(app)
        .post("/api/profiles/bio/12")
        .send({
          bio: "Hello World"
        });
        expect(res.status).to.equal(400);

    });


    it("Should Successfully add bio to user collection", async () => {
      const user555 = new Profile({
        name: "Jay",
        username: "jay@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female"
      });
      await user555.save();

      const user655 = new Female({
        _id: user555._id,
        name: "jay",
        username: "jay@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male"
      });
      await user655.save();


      const res = await request(app)
        .post("/api/profiles/bio/" + user555._id)
        .send({
          bio: "Hello World"
        });

        expect(res.status).to.be.equal(200);

    });


  });



  describe("POST /matchR", () => {
    it("Should check whether female user is a match for male user", async () => {

      const userrre = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await userrre.save();

      const wuserrre = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrre.save();

      const mlke = new Malike({
        _id: userrre._id
      });
      await mlke.save();

      const wlke = new Wolike({
        _id: wuserrre._id
      });
      await wlke.save();

      const res = await request(app)
        .post("/api/profiles/matchR")
        .send({
          mid: userrre._id,
          wid: wuserrre._id
        });
      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("msg", "Match");
    });


    it("Should return error if id is not objectid", async () => {

      const userrrs = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await userrrs.save();

      const wuserrrs = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrrs.save();

      const mlks = new Malike({
        _id: userrrs._id
      });
      await mlks.save();

      const wlks = new Wolike({
        _id: wuserrrs._id
      });
      await wlks.save();

      const res = await request(app)
        .post("/api/profiles/matchR")
        .send({
          mid: '12',
          wid: '23'
        });
      const data = res.body;
      expect(res.status).to.equal(400);
      
    });


    it("Should not be a match for male user", async () => {

      const userrrz = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['exploring', 'gym', 'pop', 'horror']
      });
      await userrrz.save();

      const wuserrrz = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrrz.save();

      const mlkz = new Malike({
        _id: userrrz._id
      });
      await mlkz.save();

      const wlkz = new Wolike({
        _id: wuserrrz._id
      });
      await wlkz.save();

      const res = await request(app)
        .post("/api/profiles/matchR")
        .send({
          mid: userrrz._id,
          wid: wuserrrz._id
        });
      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("emsg", "not Match");
    });




  });







  describe("POST /dislike", () => {
    it("Should dislike user, no match it is", async () => {

      const userrre = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await userrre.save();

      const wuserrre = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrre.save();

      const mlke = new Malike({
        _id: userrre._id
      });
      await mlke.save();

      const wlke = new Wolike({
        _id: wuserrre._id
      });
      await wlke.save();

      const res = await request(app)
        .post("/api/profiles/dislike")
        .send({
          mid: userrre._id,
          wid: wuserrre._id
        });
      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("rate", "0");
    });


    it("Should return error if id is not objectid", async () => {

      const userrrss = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await userrrss.save();

      const wuserrrss = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrrss.save();

      const mlkss = new Malike({
        _id: userrrss._id
      });
      await mlkss.save();

      const wlkss = new Wolike({
        _id: wuserrrss._id
      });
      await wlkss.save();

      const res = await request(app)
        .post("/api/profiles/dislike")
        .send({
          mid: '12',
          wid: '23'
        });
      const data = res.body;
      expect(res.status).to.equal(400);
      
    });


  




  });







  describe("POST /mcards", () => {
    it("Should retrieve all female profiles that are unseen", async () => {

      const userrre = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await userrre.save();

      const wuserrre = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrre.save();


      const wuserrree = new Female({
        name: "jennifer",
        username: "jennifer@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrree.save();


      const mlke = new Malike({
        _id: userrre._id
      });
      await mlke.save();

      const wlke = new Wolike({
        _id: wuserrre._id
      });
      await wlke.save();

      const wlkee = new Wolike({
        _id: wuserrree._id
      });
      await wlkee.save();


      await Malike.findOneAndUpdate({_id: userrre._id}, {$push: {women: [{wid: wuserrre._id, seen: "N", rate: 4}]}}).exec();

      const res = await request(app)
        .post("/api/profiles/mcards")
        .send({
          mid: userrre._id
        });
      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("msg", "Done");
    });


    it("Should give 400 status", async () => {

      const userrre = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await userrre.save();

      const wuserrre = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrre.save();


      const wuserrree = new Female({
        name: "jennifer",
        username: "jennifer@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrree.save();


      const mlke = new Malike({
        _id: userrre._id
      });
      await mlke.save();

      const wlke = new Wolike({
        _id: wuserrre._id
      });
      await wlke.save();

      const wlkee = new Wolike({
        _id: wuserrree._id
      });
      await wlkee.save();


      await Malike.findOneAndUpdate({_id: userrre._id}, {$push: {women: [{wid: wuserrre._id, seen: "N", rate: 4}]}}).exec();

      const res = await request(app)
        .post("/api/profiles/mcards")
        .send({
          mid: '12'
        });
      const data = res.body;
      expect(res.status).to.equal(400);
    });


  




  });




  describe("POST /wcards", () => {
    it("Should retrieve all male profiles that are unseen", async () => {

      const wuserrred = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrred.save();


      const muserrree = new Male({
        name: "amin",
        username: "amin@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await muserrree.save();

      const muserrre = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await muserrre.save();


      const wlke = new Wolike({
        _id: wuserrred._id
      });
      await wlke.save();

      const mlkee = new Malike({
        _id: muserrree._id
      });
      await mlkee.save();

      const mlke = new Malike({
        _id: muserrre._id
      });
      await mlke.save();

      await Wolike.findOneAndUpdate({_id: wuserrred._id}, {$push: {men: [{mid: muserrree._id, seen: "N", rate: 4}]}}).exec();

      const res = await request(app)
        .post("/api/profiles/wcards")
        .send({
          wid: wuserrred._id
        });
      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("msg", "Done");
    });


    it("Should give 400 status", async () => {

      const wuserrred = new Female({
        name: "Emma",
        username: "emma@gmail.com",
        password: "123",
        gender: "female",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await wuserrred.save();


      const muserrree = new Male({
        name: "amin",
        username: "amin@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "male",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await muserrree.save();

      const muserrre = new Male({
        name: "Brad",
        username: "brad@gmail.com",
        password: "123",
        gender: "male",
        age: 23,
        location: "georgia",
        ginterests: "female",
        interests: ['clubing', 'hiking', 'rap', 'comedy']
      });
      await muserrre.save();


      const wlke = new Wolike({
        _id: wuserrred._id
      });
      await wlke.save();

      const mlkee = new Malike({
        _id: muserrree._id
      });
      await mlkee.save();

      const mlke = new Malike({
        _id: muserrre._id
      });
      await mlke.save();

      await Wolike.findOneAndUpdate({_id: wuserrred._id}, {$push: {men: [{mid: muserrree._id, seen: "N", rate: 4}]}}).exec();


      const res = await request(app)
        .post("/api/profiles/wcards")
        .send({
          wid: '12'
        });
      expect(res.status).to.equal(400);

    });


  });




  describe("POST /removeUser", () => {
    it("should check if user is male before removing user profile from DB", async () => {


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

      const muserrre = new Male({
        _id: user._id,
        name: "mehrad",
        username: "mehrad@gmail.com",
        password: "344",
        gender: "male",
        age: 23,
        location: "california",
        ginterests: "female"
      });
      await muserrre.save();


      const res = await request(app)
        .post("/api/profiles/removeUser")
        .send({
          uid: user._id
        });
      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("msg", "Done");

    });


    it("should check if user is female before removing user profile from DB", async () => {


      const user = new Profile({
        name: "karen",
        username: "karen@gmail.com",
        password: "344",
        gender: "female",
        age: 23,
        location: "california",
        ginterests: "male"
      });
      await user.save();

      const muserrre = new Female({
        _id: user._id,
        name: "karen",
        username: "karen@gmail.com",
        password: "344",
        gender: "female",
        age: 23,
        location: "california",
        ginterests: "male"
      });
      await muserrre.save();


      const res = await request(app)
        .post("/api/profiles/removeUser")
        .send({
          uid: user._id
        });
      const data = res.body;
      expect(res.status).to.equal(200);
      expect(data).to.have.property("msg", "Done");

    });


    it("should return 400 status", async () => {



      const res = await request(app)
        .post("/api/profiles/removeUser")
        .send({
          uid: '12'
        });
      const data = res.body;
      expect(res.status).to.equal(400);

    });


  });





});