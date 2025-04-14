const express = require("express");
require("./Database/DatabaseConnecttion");
const app = express();
const port = 5000;
const morgan = require("morgan");
const auth = require("./Routes/auth");

// Enable JSON body parsing
app.use(express.json());
// Optionally, enable URL-encoded parsing if needed:
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/v1/auth", auth);

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
