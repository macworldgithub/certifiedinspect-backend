// Service/Inspection.js
const fs = require("fs");
const path = require("path");
const util = require("util");
const yup = require("yup");
const { v4: uuidv4 } = require("uuid");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const User = require("../Schema/Users/UserSchema");
const Inspection = require("../Schema/Inspections/InspectionSchema");
const UserInspectionImage = require("../Schema/Inspections/UserInspectionImageSchema");
const { redisClient } = require("../Database/Redisconnection");
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });


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
console.log(process.env.AWS_ACCESS_KEY_ID)
const validationSchema = yup.object().shape({
  user_id: yup.number().required(),
  vin: yup.string().required(),
  images: yup.array().of(
    yup.object().shape({
      title: yup.string().required(),
      type: yup.boolean().required(),
      buffer: yup.mixed().required(),
    })
  ),
});

const TEMP_FILE_PATH = path.join(__dirname, "../temp/failed_inspections.json");

const InspectionService = {
  async createInspection(data) {
    try {
      await validationSchema.validate(data, { abortEarly: false });
  
      const inspection = new Inspection({
        user_id: data.user_id,
        created_at: new Date(),
      });
  
      const savedInspection = await inspection.save();
  
      const imageUploadPromises = data.images.map(async (img) => {
        const fileName = `${uuidv4()}.jpg`;
        const key = `inspections/${savedInspection._id}/${fileName}`;
        const uploadCommand = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
          Body: img.buffer,
          ContentType: "image/jpg",
          ACL: "public-read"
        });
  
        await s3.send(uploadCommand);
  
        return {
          title: img.title,
          type: img.type,
          src: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
          key, // optional: if you want to return this in the response too
        };
      });
  
      const imageResults = await Promise.all(imageUploadPromises);
  
      const imageDocs = imageResults.map((img) => ({
        user_inspection_id: savedInspection.id,
        image_title: img.title,
        image_type: img.type,
        image_src: img.src,
        created_at: new Date(),
      }));
  
      await UserInspectionImage.insertMany(imageDocs);
  
      await redisClient.set(`inspection:${data.vin}`, JSON.stringify({ success: true }));
  
      return {
        success: true,
        message: "You will be notified shortly",
        inspection_id: savedInspection._id,
        uploaded_images: imageResults.map(img => ({
          title: img.title,
          type: img.type,
          url: img.src, // This will be like: https://bucket.s3.region.amazonaws.com/inspections/{inspection_id}/{imgname}.jpg
        })),
      };
    } catch (error) {
      console.log(error);
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
          await writeFile(`${TEMP_FILE_PATH}.bak.${Date.now()}`, fileContent); // Backup corrupted file
          tempData = [];
        }
      }
  
      tempData.push(fallbackData);
      await writeFile(TEMP_FILE_PATH, JSON.stringify(tempData, null, 2));
  
      return { success: false, message: "Data saved temporarily. Will retry soon." };
    }
  }
  ,

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
};

module.exports = InspectionService;
