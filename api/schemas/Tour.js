const { ObjectId } = require("mongodb");
const { default: mongoose } = require("mongoose");

const tourSchema = new mongoose.Schema(
  {
    _id: ObjectId,
    description: String,
    image_url: String,
    title: String
  },
  { collection: "tour" , }
);

// Tạo model từ schema
const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
