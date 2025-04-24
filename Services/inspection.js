// Service/Inspection.js

// Service/Inspection.js
const fs = require("fs");
const path = require("path");
const util = require("util");
const yup = require("yup");
const { v4: uuidv4 } = require("uuid");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const UserInspection = require("../Schema/Inspections/UserInspectionSchema");
const UserInspectionImage = require("../Schema/Inspections/UserInspectionImageSchema");
const { redisClient } = require("../Database/Redisconnection");
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const writeFile = util.promisify(fs.writeFile);
const unlinkFile = util.promisify(fs.unlink);
const readFile = util.promisify(fs.readFile);
const TEMP_FILE_PATH = path.join(__dirname, "../temp/failed_inspections.json");

const validationSchema = yup.object().shape({
  user_id: yup.number().required(),
  vin: yup.string().required(),
  images: yup.array().of(
    yup.object().shape({
      title: yup.string(),
      type: yup.boolean(),
      buffer: yup.mixed()
    })
  )
});

const InspectionService = {
  async createInspection(data) {
    try {
      // await validationSchema.validate(data, { abortEarly: false });
      console.log("data",data)
      const inspection = new UserInspection({
        user_id: data.user_id,
        inspect_id: uuidv4(),
        status: data.status ?? true,
        is_paid: data.is_paid ?? false,
        vehicle_year: data.vehicle_year,
        vehicle_make: data.vehicle_make,
        vehicle_model: data.vehicle_model,
        vehicle_vin: data.vin,
        vehicle_plate_no: data.vehicle_plate_no,
        build_date: data.build_date,
        comp_date: data.comp_date,
        no_of_keys: data.no_of_keys ?? true,
        servicebook_present: data.servicebook_present,
        servicehistory_present: data.servicehistory_present,
        last_service_date: data.last_service_date,
        registration_expiry: data.registration_expiry,
        last_mileage: data.last_mileage,
        front_wheel_d: data.front_wheel_d,
        rear_wheel_d: data.rear_wheel_d,
        cond_front_left: data.cond_front_left,
        cond_front_right: data.cond_front_right,
        cond_rear_right: data.cond_rear_right,
        cond_rear_left: data.cond_rear_left,
        cond_spare: data.cond_spare,
        transmission: data.transmission,
        body_type: data.body_type,
        odometer: data.odometer,
        fuel_type: data.fuel_type,
        drive_train: data.drive_train,
        color: data.color,
        road_test: data.road_test,
        road_test_comments: data.road_test_comments,
        general_comments: data.general_comments,
        is_pdf_generated: data.is_pdf_generated ?? false,
        is_locked: data.is_locked ?? false,
        locked_by: data.locked_by,
        approved_by: data.approved_by,
        approved_on: data.approved_on,
        report_date: data.report_date,
        inspector_notes: data.inspector_notes,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: data.deleted_at,
        page_status: data.page_status ?? false
      });
      
      console.log(inspection)

      const savedInspection = await inspection.save();

      const imageDocs = [];

      const base_url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

      for (let i = 0; i < data.images.length; i++) {
        const img = data.images[i];
        let imgKey = null;

        if (img?.buffer) {
          const fileName = `${uuidv4()}.jpg`;
          imgKey = `inspections/${savedInspection._id}/${fileName}`;
          const uploadCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imgKey,
            Body: img.buffer,
            ContentType: "image/jpg",
            ACL: "public-read"
          });
          await s3.send(uploadCommand);
        }

        imageDocs.push({
          id: i + 1,
          user_inspection_id: savedInspection.inspect_id,
          image_title: img?.title || null,
          image_type: img?.type ?? null,
          image_src: imgKey,
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      await UserInspectionImage.insertMany(imageDocs);

      await redisClient.set(`inspection:${data.vin}`, JSON.stringify({ success: true }));

      return {
        success: true,
        message: "You will be notified shortly",
        inspection_id: savedInspection._id,
        base_url,
        uploaded_images: imageDocs.map(doc => ({
          id: doc.id,
          title: doc.image_title,
          type: doc.image_type,
          url: doc.image_src ? `${base_url}${doc.image_src}` : null,
        }))
      };

    } catch (error) {
      console.error("Service Error:", error);
      const fallbackData = {
        ...data,
        time: new Date().toISOString(),
      };

      let tempData = [];
      if (fs.existsSync(TEMP_FILE_PATH)) {
        const fileContent = await readFile(TEMP_FILE_PATH, "utf8");
        try {
          tempData = JSON.parse(fileContent || "[]");
        } catch (parseError) {
          console.error("Fallback file corrupted. Creating backup and reinitializing...");
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
      const check = await redisClient.get(`inspection:${entry.vin}`);
      if (check) continue;

      const result = await this.createInspection(entry);
      if (!result.success) remaining.push(entry);
    }

    if (remaining.length > 0) {
      await writeFile(TEMP_FILE_PATH, JSON.stringify(remaining, null, 2));
    } else {
      await unlinkFile(TEMP_FILE_PATH);
    }
  },
  // async updateInspection(id, data) {
  //   try {
  //     console.log(id)
  //     console.log(data)
  //     await validationSchema.validate(data, { abortEarly: false });

  //     const existingInspection = await UserInspection.findById(id);
  //     if (!existingInspection) {
  //       return { success: false, message: "Inspection not found." };
  //     }

  //     // Update fields
  //     existingInspection.vehicle_vin = data.vin || existingInspection.vehicle_vin;
  //     existingInspection.updated_at = new Date();

  //     await existingInspection.save();

  //     const imageDocs = [];

  //     const base_url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

  //     for (let i = 0; i < data.images.length; i++) {
  //       const img = data.images[i];
  //       if (!img?.buffer) continue;

  //       const fileName = `${uuidv4()}.jpg`;
  //       const imgKey = `inspections/${existingInspection._id}/${fileName}`;
  //       const uploadCommand = new PutObjectCommand({
  //         Bucket: process.env.AWS_BUCKET_NAME,
  //         Key: imgKey,
  //         Body: img.buffer,
  //         ContentType: "image/jpg",
  //         ACL: "public-read"
  //       });

  //       await s3.send(uploadCommand);

  //       imageDocs.push({
  //         id: i + 1,
  //         user_inspection_id: existingInspection.id,
  //         image_title: img?.title || null,
  //         image_type: img?.type ?? null,
  //         image_src: imgKey,
  //         created_at: new Date(),
  //         updated_at: new Date()
  //       });
  //     }

  //     if (imageDocs.length > 0) {
  //       await UserInspectionImage.deleteMany({ user_inspection_id: existingInspection.id });
  //       await UserInspectionImage.insertMany(imageDocs);
  //     }

  //     await redisClient.set(`inspection:${data.vin}`, JSON.stringify({ success: true }));

  //     return {
  //       success: true,
  //       message: "Inspection updated successfully",
  //       inspection_id: existingInspection._id,
  //       base_url,
  //       uploaded_images: imageDocs.map(doc => ({
  //         id: doc.id,
  //         title: doc.image_title,
  //         type: doc.image_type,
  //         url: `${base_url}${doc.image_src}`,
  //       }))
  //     };

  //   } catch (error) {
  //     console.error("Update Service Error:", error);
  //     return { success: false, message: "Failed to update inspection. Please try again." };
  //   }
  // },
  async updateInspection(id, data) {
    try {
      console.log(id);
      console.log(data);
  
      await validationSchema.validate(data, { abortEarly: false });
  
      const existingInspection = await UserInspection.findById(id);
      if (!existingInspection) {
        return { success: false, message: "Inspection not found." };
      }
  
      // Update all allowed fields
      const updatableFields = [
        "status", "is_paid", "vehicle_year", "vehicle_make", "vehicle_model",
        "vin", "vehicle_plate_no", "build_date", "comp_date", "no_of_keys",
        "servicebook_present", "servicehistory_present", "last_service_date",
        "registration_expiry", "last_mileage", "front_wheel_d", "rear_wheel_d",
        "cond_front_left", "cond_front_right", "cond_rear_right", "cond_rear_left",
        "cond_spare", "transmission", "body_type", "odometer", "fuel_type",
        "drive_train", "color", "road_test", "road_test_comments",
        "general_comments", "is_pdf_generated", "is_locked", "locked_by",
        "approved_by", "approved_on", "report_date", "inspector_notes", "page_status"
      ];
  
      updatableFields.forEach(field => {
        if (data[field] !== undefined) {
          existingInspection[field === "vin" ? "vehicle_vin" : field] = data[field];
        }
      });
  
      existingInspection.updated_at = new Date();
      await existingInspection.save();
  
      const base_url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
  
      const imageDocs = [];
  
      if (Array.isArray(data.images) && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          const img = data.images[i];
          if (!img?.buffer) continue;
  
          const fileName = `${uuidv4()}.jpg`;
          const imgKey = `inspections/${existingInspection._id}/${fileName}`;
          const uploadCommand = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: imgKey,
            Body: img.buffer,
            ContentType: "image/jpg",
            ACL: "public-read"
          });
  
          await s3.send(uploadCommand);
  
          imageDocs.push({
            id: i + 1,
            user_inspection_id: existingInspection.id,
            image_title: img?.title || null,
            image_type: img?.type ?? null,
            image_src: imgKey,
            created_at: new Date(),
            updated_at: new Date()
          });
        }
  
        await UserInspectionImage.deleteMany({ user_inspection_id: existingInspection.id });
        await UserInspectionImage.insertMany(imageDocs);
      }
  
      await redisClient.set(`inspection:${data.vin}`, JSON.stringify({ success: true }));
  
      return {
        success: true,
        message: "Inspection updated successfully",
        inspection_id: existingInspection._id,
        base_url,
        uploaded_images: imageDocs.map(doc => ({
          id: doc.id,
          title: doc.image_title,
          type: doc.image_type,
          url: `${base_url}${doc.image_src}`,
        }))
      };
    } catch (error) {
      console.error("Update Service Error:", error);
      return { success: false, message: "Failed to update inspection. Please try again." };
    }
  }
  
};

module.exports = InspectionService;
// const fs = require("fs");
// const path = require("path");
// const util = require("util");
// const yup = require("yup");
// const { v4: uuidv4 } = require("uuid");
// const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
// const User = require("../Schema/Users/UserSchema");
// const Inspection = require("../Schema/Inspections/InspectionSchema");
// const UserInspectionImage = require("../Schema/Inspections/UserInspectionImageSchema");
// const { redisClient } = require("../Database/Redisconnection");
// require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });


// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   }
// });

// const writeFile = util.promisify(fs.writeFile);
// const unlinkFile = util.promisify(fs.unlink);
// const readFile = util.promisify(fs.readFile);
// console.log(process.env.AWS_ACCESS_KEY_ID)
// const validationSchema = yup.object().shape({
//   user_id: yup.number().required(),
//   vin: yup.string().required(),
//   images: yup.array().of(
//     yup.object().shape({
//       title: yup.string().required(),
//       type: yup.boolean().required(),
//       buffer: yup.mixed().required(),
//     })
//   ),
// });

// const TEMP_FILE_PATH = path.join(__dirname, "../temp/failed_inspections.json");

// const InspectionService = {
//   async createInspection(data) {
//     try {
//       await validationSchema.validate(data, { abortEarly: false });
  
//       const inspection = new Inspection({
//         user_id: data.user_id,
//         created_at: new Date(),
//       });
  
//       const savedInspection = await inspection.save();
  
//       const imageUploadPromises = data.images.map(async (img) => {
//         const fileName = `${uuidv4()}.jpg`;
//         const key = `inspections/${savedInspection._id}/${fileName}`;
//         const uploadCommand = new PutObjectCommand({
//           Bucket: process.env.AWS_BUCKET_NAME,
//           Key: key,
//           Body: img.buffer,
//           ContentType: "image/jpg",
//           ACL: "public-read"
//         });
  
//         await s3.send(uploadCommand);
  
//         return {
//           title: img.title,
//           type: img.type,
//           src: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
//           key, // optional: if you want to return this in the response too
//         };
//       });
  
//       const imageResults = await Promise.all(imageUploadPromises);
  
//       const imageDocs = imageResults.map((img) => ({
//         user_inspection_id: savedInspection.id,
//         image_title: img.title,
//         image_type: img.type,
//         image_src: img.src,
//         created_at: new Date(),
//       }));
  
//       await UserInspectionImage.insertMany(imageDocs);
  
//       await redisClient.set(`inspection:${data.vin}`, JSON.stringify({ success: true }));
  
//       return {
//         success: true,
//         message: "You will be notified shortly",
//         inspection_id: savedInspection._id,
//         uploaded_images: imageResults.map(img => ({
//           title: img.title,
//           type: img.type,
//           url: img.src, // This will be like: https://bucket.s3.region.amazonaws.com/inspections/{inspection_id}/{imgname}.jpg
//         })),
//       };
//     } catch (error) {
//       console.log(error);
//       const fallbackData = {
//         ...data,
//         time: new Date().toISOString(),
//       };
  
//       let tempData = [];
//       if (fs.existsSync(TEMP_FILE_PATH)) {
//         const fileContent = await readFile(TEMP_FILE_PATH, "utf8");
//         try {
//           tempData = JSON.parse(fileContent || "[]");
//         } catch (parseError) {
//           console.error("Fallback file corrupted. Creating backup and reinitializing...");
//           await writeFile(`${TEMP_FILE_PATH}.bak.${Date.now()}`, fileContent); // Backup corrupted file
//           tempData = [];
//         }
//       }
  
//       tempData.push(fallbackData);
//       await writeFile(TEMP_FILE_PATH, JSON.stringify(tempData, null, 2));
  
//       return { success: false, message: "Data saved temporarily. Will retry soon." };
//     }
//   }
//   ,

//   async retryFailedInsertions() {
//     if (!fs.existsSync(TEMP_FILE_PATH)) return;

//     const fileContent = await readFile(TEMP_FILE_PATH, "utf8");
//     const tempData = JSON.parse(fileContent);

//     const remaining = [];

//     for (const entry of tempData) {
//       const check = await redisClient.get(`inspection:${entry.vin}`);
//       if (check) continue;

//       const result = await this.createInspection(entry);
//       if (!result.success) remaining.push(entry);
//     }

//     if (remaining.length > 0) {
//       await writeFile(TEMP_FILE_PATH, JSON.stringify(remaining, null, 2));
//     } else {
//       await unlinkFile(TEMP_FILE_PATH);
//     }
//   },
// };

// module.exports = InspectionService;