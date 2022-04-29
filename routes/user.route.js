const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");

router
  .route("/")
  .get(controller.getAllUsers)
  .post(controller.createUser);
router
  .route("/:id")
  .get(controller.getUser)
  .put(controller.updateUser)
  .delete(controller.deleteUser);

router
  .route("/home/:id")
  .get(controller.getUserInfo);

router
  .route("/userAttr/:id")
  .post(controller.addAtrr);

router
  .route("/bio/:id")
  .post(controller.addBio);

router
  .route("/matchR")
  .post(controller.addMatch);

router
  .route("/dislike")
  .post(controller.noMatch);

router
  .route("/mcards")
  .post(controller.getWcards);

router
  .route("/wcards")
  .post(controller.getMcards);

router
  .route("/removeUser")
  .post(controller.rmvUser);

module.exports = router;