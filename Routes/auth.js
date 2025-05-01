// /**
//  * @swagger
//  * tags:
//  *   name: Account
//  *   description: Account management APIs
//  */

// /**
//  * @swagger
//  * /v1/auth/request-account:
//  *   post:
//  *     summary: Submit a request to create an account
//  *     tags: [Account]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - name
//  *               - email
//  *               - contact
//  *               - password
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               contact:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       201:
//  *         description: Account request submitted successfully
//  *       403:
//  *         description: Email already exists in request list
//  *       422:
//  *         description: Validation error
//  *       500:
//  *         description: Internal server error
//  */

// /**
//  * @swagger
//  * /v1/auth/create-account:
//  *   post:
//  *     summary: Create an account from approved requests
//  *     tags: [Account]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - name
//  *               - email
//  *               - contact
//  *               - password
//  *             properties:
//  *               name:
//  *                 type: string
//  *               email:
//  *                 type: string
//  *               contact:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Account created successfully
//  *       403:
//  *         description: Account already exists
//  *       422:
//  *         description: Validation error
//  *       500:
//  *         description: Internal server error
//  */

// /**
//  * @swagger
//  * /v1/auth/login:
//  *   post:
//  *     summary: Login to an existing account
//  *     tags: [Account]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - password
//  *             properties:
//  *               email:
//  *                 type: string
//  *               password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Login successful
//  *       401:
//  *         description: Invalid email or password
//  *       404:
//  *         description: Account not found
//  *       500:
//  *         description: Internal server error
//  */


// const express = require("express");
// const {
//   request_to_create_account,
//   create_account,login_account
// } = require("../Services/Account");

// const router = express.Router();

// router.post("/request-account", request_to_create_account);
// router.post("/create-account", create_account);
// router.post("/login", login_account); 

// module.exports = router;
