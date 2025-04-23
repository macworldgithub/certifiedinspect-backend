// swagger.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Account API",
      version: "1.0.0",
      description: "API for requesting accounts, creating accounts, and logging in.",
    },
    servers: [
      {
        url: "http://localhost:5000", // Update this if your server runs on a different port
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your route files (adjust if needed)
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
