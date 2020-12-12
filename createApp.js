require("dotenv").config();

const express = require("express");
const sharp = require("sharp");
const { v4 } = require("uuid");
const Busboy = require("busboy");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const Image = require("./models/Image");
const { createDatabase } = require("./db/index");
const swaggerDocument = YAML.load("./swagger.yaml");
const AWS = require("aws-sdk");

AWS.config.region = "eu-central-1";
const ID = process.env.AWS_AccessKeyID;
const SECRET = process.env.AWS_SecretAccessKey;
const Bucket = process.env.S3_BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

async function createApp() {
  await createDatabase();

  const app = express();

  // api docs endpoint
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // create images
  app.post("/image", (req, res) => {
    // get file from request
    var busboy = new Busboy({ headers: req.headers });

    const imgRecord = new Image({
      id: v4(),
    });

    busboy.on(
      "file",
      async function (fieldname, file, filename, encoding, mimetype) {
        imgRecord.name = filename;

        const s3Key = imgRecord.id + "_" + filename;
        const params = {
          ACL: "public-read",
          Bucket, // TODO: Put backticks
          Key: s3Key, // the name you want the file to have in your S3 bucket
          Body: file,
        };

        // uploading your file to the S3 bucket
        s3.upload(params, async function (err, data) {
          if (err) {
            throw err;
            res.status(500);
          }
          imgRecord.url = data.Location;
          imgRecord.s3Key = s3Key;
          await imgRecord.save();

          res.json(imgRecord);
        });
        // 3. Add endpoint to retrieve image
        // 3. What is http multipart data
        // 4. Buffer and Streams in Node.js
      }
    );
    busboy.on("finish", function () {});
    return req.pipe(busboy);
    // put it in S3
    // need to store address
  });

  // Add an endpoint to retrieve the images with the id
  app.get("/image/:imageId", async (req, res) => {
    // get the id
    const imageId = req.params.imageId;

    // get the image
    const image = await Image.findOne({ id: imageId }).exec();

    if (!image) {
      res.status(404);
      res.send("Image with the id requested was not found.");
    }

    res.json(image);
  });

  // Add endpoint to retrieve image in specific format
  app.get("/image/:format/:imageId", async (req, res) => {
    const imageId = req.params.imageId;
    const format = req.params.format;

    // Output images can be in JPEG, PNG, WebP, and TIFF
    if (
      format !== "png" &&
      format !== "jpeg" &&
      format !== "webP" &&
      format !== "tiff"
    ) {
      res.status(400);
      res.send(`Format must be one of the following: png, jpeg, webP, tiff`);
    }
    // retrieve image
    const imgRecord = await Image.findOne({ id: imageId }).exec();

    // apply transform
    s3.getObject(
      {
        Bucket,
        Key: imgRecord.s3Key,
      },
      async function (err, data) {
        if (err) {
          console.log(err, err.stack);
          res.status(500);
          res.send(`Error in image retrieval`);
        } else {
          const imgBuffer = data.Body;
          const pngBuffer = await sharp(imgBuffer).toFormat(format).toBuffer();
          res.end(pngBuffer);
        }
      }
    );
  });

  return app;
}

module.exports = createApp;
