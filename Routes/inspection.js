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



module.exports = router;

