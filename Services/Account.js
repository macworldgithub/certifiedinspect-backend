const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const RequestAccountSchema = require("../Schema/Accounts/Request.Account.schema");
const AccountSchema = require("../Schema/Accounts/Account.schema");
const {
  request_to_create_account_validater,
} = require("../Validation/Request.User.Validation");
const {
  create_account_validater,
} = require("../Validation/Account.Validation");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// --- Request for account ---
const request_to_create_account = async (req, res) => {
  try {
    await request_to_create_account_validater.validate(req.body, {
      abortEarly: false,
    });

    const exist = await RequestAccountSchema.findOne({ email: req.body?.email });

    if (!exist) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newRequest = new RequestAccountSchema({
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: hashedPassword,
      });

      await newRequest.save();

      res.status(201).json({ message: "Account request submitted successfully." });
    } else {
      return res.status(403).json({ message: "Email already exists in request list." });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(422).json({ message: error.errors });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

// --- Create account ---
const create_account = async (req, res) => {
  try {
    await create_account_validater.validate(req.body);

    await RequestAccountSchema.findOneAndDelete({ email: req.body?.email });

    const exist = await AccountSchema.findOne({ email: req.body?.email });

    if (!exist) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);

      const newAccount = new AccountSchema({
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        password: hashedPassword,
      });

      await newAccount.save();

      const token = jwt.sign(
        { email: newAccount.email, id: newAccount._id },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({
        message: "Account created successfully",
        token: token,
      });
    } else {
      return res.status(403).json({ message: "Account already exists" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(422).json({ message: error.errors });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};


const login_account = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if account exists
    const user = await AccountSchema.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { email: user.email, id: user._id },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { request_to_create_account, create_account, login_account};




// const RequestAccountSchema = require("../Schema/Accounts/Request.Account.schema");
// const AccountSchema = require("../Schema/Accounts/Account.schema");
// const {
//   request_to_create_account_validater,
// } = require("../Validation/Request.User.Validation");
// const {
//   create_account_validater,
// } = require("../Validation/Account.Validation");
// const { response } = require("express");

// const request_to_create_account = async (req, res) => {
//   try {
//     await request_to_create_account_validater.validate(req.body, {
//       abortEarly: false,
//     });

//     //Check if already exist
//     const exist = await RequestAccountSchema.findOne({
//       email: req?.body?.email,
//     });

//     if (!exist) {
//       const response = await RequestAccountSchema.insertOne(req.body);
//       response.save();
//     } else {
//       return res.status(403).json({ message: "Email Already Exist" });
//     }

//     res.status(201).json({ message: "Account created successfully." });
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       return res.status(422).json({ message: error.errors });
//     }

//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// const create_account = async (req, res) => {
//   try {
//     await create_account_validater.validate(req.body);

//     // Remove from request
//     await RequestAccountSchema.findOneAndDelete({
//       email: req.body?.email,
//     });
//     //if already exist in account schema
//     const exist = await AccountSchema.findOne({ email: req.body?.email });

//     if (!exist) {
//       const response = await AccountSchema.insertOne(req.body);
//       response.save();
//       return res.status(200).json({ message: "Account created successfully" });
//     } else {
//       return res.status(403).json({ message: "Accout already exist" });
//     }
//   } catch (error) {
//     if (error.name === "ValidationError") {
//       return res.status(422).json({ message: error.errors });
//     }

//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// module.exports = { request_to_create_account, create_account };
