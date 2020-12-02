const AWS = require("aws-sdk");

AWS.config.region = "eu-central-1";
const ID = process.env.AWS_AccessKeyID;
const SECRET = process.env.AWS_SecretAccessKey;
const Bucket = process.env.S3_BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

const uploadFile = async (fileName, fileContent, imgRecord) => {
  // setting the S3 load parameters
  const s3Key = imgRecord.id + "_" + fileName;
  const params = {
    ACL: "public-read",
    Bucket, // TODO: Put backticks
    Key: s3Key, // the name you want the file to have in your S3 bucket
    Body: fileContent,
  };
  // uploading your file to the S3 bucket
  s3.upload(params, function (err, data) {
    if (err) {
      throw err;
    }
    imgRecord.url = data.Location;
    imgRecord.s3Key = s3Key;
    imgRecord.save();

    return data.Location;
  });
};

module.exports = { uploadFile, s3, Bucket };
