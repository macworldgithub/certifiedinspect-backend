const express = require("express");
const {
  request_to_create_account,
  create_account,login_account
} = require("../Services/Account");

const router = express.Router();

router.post("/request-account", request_to_create_account);
router.post("/create-account", create_account);
router.post("/login", login_account); // <-- NEW LOGIN ROUTE

module.exports = router;
