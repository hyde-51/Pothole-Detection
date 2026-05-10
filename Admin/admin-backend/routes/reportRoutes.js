import express from "express";
import Report from "../models/Report.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const report = await Report.create({
      input_type: req.body.input_type || "image",
      model_type: req.body.model_type,
      final_verdict: req.body.final_verdict,

      image_url: req.body.image_url,
      annotated_image_url: req.body.annotated_image_url,
      video_url: req.body.video_url,
      annotated_video_url: req.body.annotated_video_url,

      pothole_count: Number(req.body.pothole_count || 0),
      severity: req.body.severity || "None",
      damage_percentage: Number(req.body.damage_percentage || 0),

      traffic: req.body.traffic,
      zone: req.body.zone,
      camera_distance: req.body.camera_distance,

      latitude: req.body.latitude,
      longitude: req.body.longitude,

      potholes: req.body.potholes || [],
      cnn_result: req.body.cnn_result || {},

      frames_with_potholes: Number(req.body.frames_with_potholes || 0),
      total_frames_checked: Number(req.body.total_frames_checked || 0),
      total_frames_in_video: Number(req.body.total_frames_in_video || 0),
      fps: Number(req.body.fps || 0),
      detections_by_frame: req.body.detections_by_frame || {},
    });

    res.status(201).json({
      success: true,
      message: "Report saved successfully",
      report,
    });
  } catch (error) {
    console.error("Report save error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save report",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete report",
      error: error.message,
    });
  }
});

export default router;