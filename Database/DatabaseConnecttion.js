const mongoose = require("mongoose");

const url =
  "mongodb://anas:123@localhost:3200/certifiedinspect?authSource=admin";

mongoose
  .connect(url)
  .then(() => {
    console.log("Connection Succesfully established");
  })
  .catch((err) => {
    console.error(err);
  });

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

module.exports = mongoose;
