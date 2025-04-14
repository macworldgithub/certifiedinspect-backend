const RequestAccountSchema = require("../Schema/Accounts/Request.Account.schema");
const AccountSchema = require("../Schema/Accounts/Account.schema");
const {
  request_to_create_account_validater,
} = require("../Validation/Request.User.Validation");
const {
  create_account_validater,
} = require("../Validation/Account.Validation");
const { response } = require("express");

const request_to_create_account = async (req, res) => {
  try {
    await request_to_create_account_validater.validate(req.body, {
      abortEarly: false,
    });

    //Check if already exist
    const exist = await RequestAccountSchema.findOne({
      email: req?.body?.email,
    });

    if (!exist) {
      const response = await RequestAccountSchema.insertOne(req.body);
      response.save();
    } else {
      return res.status(403).json({ message: "Email Already Exist" });
    }

    res.status(201).json({ message: "Account created successfully." });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(422).json({ message: error.errors });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

const create_account = async (req, res) => {
  try {
    await create_account_validater.validate(req.body);

    // Remove from request
    await RequestAccountSchema.findOneAndDelete({
      email: req.body?.email,
    });
    //if already exist in account schema
    const exist = await AccountSchema.findOne({ email: req.body?.email });

    if (!exist) {
      const response = await AccountSchema.insertOne(req.body);
      response.save();
      return res.status(200).json({ message: "Account created successfully" });
    } else {
      return res.status(403).json({ message: "Accout already exist" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(422).json({ message: error.errors });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { request_to_create_account, create_account };
