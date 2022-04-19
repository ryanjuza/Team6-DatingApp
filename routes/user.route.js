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

module.exports = router;