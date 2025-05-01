
const path = require("path");
const fs = require("fs");
const util = require("util");
const { v4: uuidv4 } = require("uuid");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const pool = require("../Database/DatabaseConnecttion");
const { redisClient } = require("../Database/Redisconnection");

require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const TEMP_FILE_PATH = path.join(__dirname, "../temp/failed_inspections.json");
const writeFile = util.promisify(fs.writeFile);
const unlinkFile = util.promisify(fs.unlink);
const readFile = util.promisify(fs.readFile);

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const InspectionService = {
  async createInspection(data) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const inspect_id = uuidv4();

      const [inspectionResult] = await connection.execute(
        `INSERT INTO user_inspections (
          inspect_id, user_id, status, is_paid, vehicle_year, vehicle_make, vehicle_model,
          vehicle_vin, vehicle_plate_no, build_date, comp_date, no_of_keys, servicebook_present,
          servicehistory_present, last_service_date, registration_expiry, last_mileage, front_wheel_d,
          rear_wheel_d, cond_front_left, cond_front_right, cond_rear_right, cond_rear_left,
          cond_spare, transmission, body_type, odometer, fuel_type, drive_train, color, road_test,
          road_test_comments, general_comments, is_pdf_generated, is_locked, locked_by, approved_by,
          approved_on, report_date, inspector_notes, created_at, updated_at, deleted_at, page_status
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?, ?
        )`,
        [
          inspect_id, data.user_id, data.status ?? true, data.is_paid ?? false,
          data.vehicle_year, data.vehicle_make, data.vehicle_model, data.vin,
          data.vehicle_plate_no, data.build_date, data.comp_date,
          data.no_of_keys ?? true, data.servicebook_present, data.servicehistory_present,
          data.last_service_date, data.registration_expiry, data.last_mileage,
          data.front_wheel_d, data.rear_wheel_d, data.cond_front_left,
          data.cond_front_right, data.cond_rear_right, data.cond_rear_left,
          data.cond_spare, data.transmission, data.body_type, data.odometer,
          data.fuel_type, data.drive_train, data.color, data.road_test,
          data.road_test_comments, data.general_comments, data.is_pdf_generated ?? false,
          data.is_locked ?? false, data.locked_by, data.approved_by, data.approved_on,
          data.report_date, data.inspector_notes, data.deleted_at, data.page_status ?? false
        ]
      );

      const insertedId = inspectionResult.insertId;
      const base_url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

      const imageDocs = [];

      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        let imgKey = null;

        if (img?.buffer) {
          const fileName = `${uuidv4()}.jpg`;
          imgKey = `inspections/${insertedId}/${fileName}`;
          const uploadCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imgKey,
            Body: img.buffer,
            ContentType: "image/jpg",
            ACL: "public-read"
          });
          await s3.send(uploadCommand);
        }

        imageDocs.push([
          inspect_id,
          img?.title || null,
          img?.type ?? null,
          imgKey ? `${base_url}${imgKey}` : null,
          new Date(),
          new Date(),
          null
        ]);
      }

      if (imageDocs.length > 0) {
        await connection.query(
          `INSERT INTO user_inspection_images (user_inspection_id, image_title, image_type, image_src, created_at, updated_at, deleted_at) VALUES ?`,
          [imageDocs]
        );
      }

      await connection.commit();
      await connection.release();

      // await redisClient.set(`inspection:${data.vin}`, JSON.stringify({ success: true }));
      await redisClient.set(`inspection:${inspect_id}`, JSON.stringify({ success: true }));


      return {
        success: true,
        message: "You will be notified shortly",
        inspection_id: insertedId,
        base_url,
        uploaded_images: imageDocs.map((doc, idx) => ({
          id: idx + 1,
          title: doc[1],
          type: doc[2],
          url: doc[3] ? `${doc[3]}` : null,
        }))
      };
    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error("MySQL Inspection Insert Error:", error);

      const fallbackData = {
        ...data,
        inspect_id,

        time: new Date().toISOString()
      };
      // const fallbackData = {
      //   ...data,
      //   

      //   time: new Date().toISOString()
      // };

      let tempData = [];
      if (fs.existsSync(TEMP_FILE_PATH)) {
        const fileContent = await readFile(TEMP_FILE_PATH, "utf8");
        try {
          tempData = JSON.parse(fileContent || "[]");
        } catch (e) {
          await writeFile(`${TEMP_FILE_PATH}.bak.${Date.now()}`, fileContent);
          tempData = [];
        }
      }

      tempData.push(fallbackData);
      await writeFile(TEMP_FILE_PATH, JSON.stringify(tempData, null, 2));

      return { success: false, message: "Data saved temporarily. Will retry soon." };
    }
  },

  async retryFailedInsertions() {
    if (!fs.existsSync(TEMP_FILE_PATH)) return;

    const fileContent = await readFile(TEMP_FILE_PATH, "utf8");
    const tempData = JSON.parse(fileContent);
    const remaining = [];

    for (const entry of tempData) {
      // const check = await redisClient.get(`inspection:${entry.vin}`);
      const check = await redisClient.get(`inspection:${entry.inspect_id}`);
      if (check) continue;

      const result = await this.createInspection(entry);
      if (!result.success) remaining.push(entry);
    }

    if (remaining.length > 0) {
      await writeFile(TEMP_FILE_PATH, JSON.stringify(remaining, null, 2));
    } else {
      await unlinkFile(TEMP_FILE_PATH);
    }
  }
};

module.exports = InspectionService;



