require("dotenv").config();

const express = require("express");
const sharp = require("sharp");
const { v4 } = require("uuid");
const Busboy = require("busboy");

const Image = require("./models/Image");
const { createDatabase } = require("./db/index");
const { uploadFile, s3, Bucket } = require("./util/fileStorage.js");

async function createApp() {
  await createDatabase();

  const app = express();

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

        // save
        await imgRecord.save();

        await uploadFile(filename, file, imgRecord);
        // 3. Add endpoint to retrieve image
        // 3. What is http multipart data
        // 4. Buffer and Streams in Node.js
        res.json(imgRecord);
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
      res.status(500);
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
