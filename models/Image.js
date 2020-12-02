const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
  id: { type: String, required: true },
  name: {
    type: String,
  },
  created_at: { type: Date, default: Date.now },
  url: { type: String },
  s3Key: { type: String },
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
