const express = require("express");
require("./Database/DatabaseConnecttion");
const app = express();
const port = 5000;
const morgan = require("morgan");
const auth = require("./Routes/auth");
const inspectionRoutes = require('./Routes/inspection');
const cron = require("node-cron");
const InspectionService = require("./Services/Inspection");



const { connectRedis } = require('./Database/Redisconnection');

(async () => {
  await connectRedis();
  console.log('Redis connected!');
})();

// Enable JSON body parsing
app.use(express.json());
// Optionally, enable URL-encoded parsing if needed:
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/v1/auth", auth);

app.use('/v1/inspection', inspectionRoutes);

// cron.schedule("*/10 * * * *", async () => {
//   console.log("Retrying failed inspections...");
//   await InspectionService.retryFailedInsertions();
// });

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
