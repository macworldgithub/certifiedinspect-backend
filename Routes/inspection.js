// route/inspection.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const InspectionService = require("../Services/Inspection");

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/submit", upload.array("images", 17), async (req, res) => {
  try {
    const images = Array.from({ length: 17 }).map((_, i) => {
      const file = req.files[i];
      const title = req.body[`title_${i}`];
      const type = req.body[`type_${i}`];

      return file ? {
        title,
        type: type === 'true',
        buffer: file.buffer,
      } : null;
    });

    const result = await InspectionService.createInspection({
      user_id: parseInt(req.body.user_id),
      vin: req.body.vin,
      images,
    });

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("Route Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;

// const express = require("express");
// const multer = require("multer");
// const router = express.Router();
// const InspectionService = require("../Services/Inspection");

// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// router.post("/submit", upload.array("images", 17), async (req, res) => {
//   try {
//     console.log("Request Body:", req.body);
//     const images = req.files.map((file, i) => ({
//       title: req.body[`title_${i}`],
//       type: req.body[`type_${i}`] === 'true',
//       buffer: file.buffer,
//     }));

//     const result = await InspectionService.createInspection({
//       user_id: parseInt(req.body.user_id),
//       vin: req.body.vin,
//       images,
//     });

//     return res.status(result.success ? 200 : 500).json(result);
//   } catch (error) {
//     console.error("Route Error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

// module.exports = router;
