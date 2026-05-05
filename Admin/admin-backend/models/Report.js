import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    input_type: {
      type: String,
      default: "image",
    },

    file_url: String,
    file_type: String,
    cloudinary_public_id: String,
    cloudinary_resource_type: String,

    pothole_count: {
      type: Number,
      default: 0,
    },

    severity: {
      type: String,
      default: "None",
    },

    damage_percentage: {
      type: Number,
      default: 0,
    },

    traffic: String,
    zone: String,
    camera_distance: String,

    latitude: String,
    longitude: String,

    potholes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);