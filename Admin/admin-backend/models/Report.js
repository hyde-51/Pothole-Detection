import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    input_type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },

    model_type: String,
    final_verdict: String,

    image_url: String,
    annotated_image_url: String,

    video_url: String,
    annotated_video_url: String,

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

    cnn_result: {
      type: Object,
      default: {},
    },

    frames_with_potholes: {
      type: Number,
      default: 0,
    },

    total_frames_checked: {
      type: Number,
      default: 0,
    },

    total_frames_in_video: {
      type: Number,
      default: 0,
    },

    fps: {
      type: Number,
      default: 0,
    },

    detections_by_frame: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);