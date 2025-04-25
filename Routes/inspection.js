// route/inspection.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const InspectionService = require("../Services/inspection");

const storage = multer.memoryStorage();
const upload = multer({ storage });
router.post("/submit", upload.array("images", 17), async (req, res) => {
  try {
    const images = Array.from({ length: 17 }).map((_, i) => {
      const file = req.files[i];
      const title = req.body[`title_${i}`];
      const type = req.body[`type_${i}`];

      return file
        ? {
            title,
            type: isNaN(parseInt(type)) ? null : parseInt(type), 
            buffer: file.buffer,
          }
        : null;
    });

    const {
      user_id,
      vin,
      status,
      is_paid,
      vehicle_year,
      vehicle_make,
      vehicle_model,
      vehicle_plate_no,
      build_date,
      comp_date,
      no_of_keys,
      servicebook_present,
      servicehistory_present,
      last_service_date,
      registration_expiry,
      last_mileage,
      front_wheel_d,
      rear_wheel_d,
      cond_front_left,
      cond_front_right,
      cond_rear_right,
      cond_rear_left,
      cond_spare,
      transmission,
      body_type,
      odometer,
      fuel_type,
      drive_train,
      color,
      road_test,
      road_test_comments,
      general_comments,
      is_pdf_generated,
      is_locked,
      locked_by,
      approved_by,
      approved_on,
      report_date,
      inspector_notes,
      deleted_at,
      page_status
    } = req.body;

    const result = await InspectionService.createInspection({
      user_id: parseInt(user_id),
      vin,
      images,
      status: status === "true",
      is_paid: is_paid === "true",
      vehicle_year,
      vehicle_make,
      vehicle_model,
      vehicle_plate_no,
      build_date,
      comp_date,
      no_of_keys: no_of_keys === "true",
      servicebook_present: servicebook_present === "true",
      servicehistory_present: servicehistory_present === "true",
      last_service_date,
      registration_expiry,
      last_mileage,
      front_wheel_d,
      rear_wheel_d,
      cond_front_left,
      cond_front_right,
      cond_rear_right,
      cond_rear_left,
      cond_spare,
      transmission,
      body_type,
      odometer,
      fuel_type,
      drive_train,
      color,
      road_test,
      road_test_comments,
      general_comments,
      is_pdf_generated: is_pdf_generated === "true",
      is_locked: is_locked === "true",
      locked_by,
      approved_by,
      approved_on,
      report_date,
      inspector_notes,
      deleted_at,
      page_status: page_status === "true"
    });

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("Route Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.put("/update/:id", upload.array("images", 17), async (req, res) => {
  try {
    const { id } = req.params;

    const images = req.files.map((file, index) => ({
      title: req.body[`title_${index}`] || null,
      type: parseInt(req.body[`type_${index}`]) || null,
      buffer: file.buffer,
    }));
    

    const body = {
      user_id: parseInt(req.body.user_id) || null,
      vin: req.body.vin,
      status: req.body.status === 'true',
      is_paid: req.body.is_paid === 'true',
      vehicle_year: req.body.vehicle_year,
      vehicle_make: req.body.vehicle_make,
      vehicle_model: req.body.vehicle_model,
      vehicle_plate_no: req.body.vehicle_plate_no,
      build_date: req.body.build_date,
      comp_date: req.body.comp_date,
      no_of_keys: req.body.no_of_keys === 'true',
      servicebook_present: req.body.servicebook_present === 'true',
      servicehistory_present: req.body.servicehistory_present === 'true',
      last_service_date: req.body.last_service_date,
      registration_expiry: req.body.registration_expiry,
      last_mileage: req.body.last_mileage,
      front_wheel_d: req.body.front_wheel_d,
      rear_wheel_d: req.body.rear_wheel_d,
      cond_front_left: req.body.cond_front_left,
      cond_front_right: req.body.cond_front_right,
      cond_rear_right: req.body.cond_rear_right,
      cond_rear_left: req.body.cond_rear_left,
      cond_spare: req.body.cond_spare,
      transmission: req.body.transmission,
      body_type: req.body.body_type,
      odometer: req.body.odometer,
      fuel_type: req.body.fuel_type,
      drive_train: req.body.drive_train,
      color: req.body.color,
      road_test: req.body.road_test === 'true',
      road_test_comments: req.body.road_test_comments,
      general_comments: req.body.general_comments,
      is_pdf_generated: req.body.is_pdf_generated === 'true',
      is_locked: req.body.is_locked === 'true',
      locked_by: req.body.locked_by,
      approved_by: req.body.approved_by,
      approved_on: req.body.approved_on,
      report_date: req.body.report_date,
      inspector_notes: req.body.inspector_notes,
      page_status: req.body.page_status === 'true',
      images,
    };

    const result = await InspectionService.updateInspection(id, body);
    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error("Update Route Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// router.put("/update/:id", upload.array("images", 17), async (req, res) => {
//   try {
//     const { id } = req.params;

//     const images = req.files.map((file, index) => ({
//       title: req.body[`title_${index}`] || null,
//       type: req.body[`type_${index}`] === 'true',
//       buffer: file.buffer,
//     }));

//     const result = await InspectionService.updateInspection(id, {
//       user_id: parseInt(req.body.user_id) || null, // Optional
//       vin: req.body.vin,
//       images,
//     });

//     return res.status(result.success ? 200 : 500).json(result);
//   } catch (error) {
//     console.error("Update Route Error:", error);
//     return res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });


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
