const express = require("express");
const { request_to_create_account } = require("../Services/Account");
const router = express.Router();

router.post("/request-account", (req, res) => {
  request_to_create_account(req, res);
});

router.post("/create-account", (req, res) => {
  create_account(req, res);
});

module.exports = router;
