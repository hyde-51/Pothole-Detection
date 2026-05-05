import express from "express";
import streamifier from "streamifier";

import cloudinary from "../config/cloudinary.js";
import Report from "../models/Report.js";
import upload from "../middleware/upload.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadToCloudinary = (fileBuffer, resourceType) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pothole_reports",
        resource_type: resourceType,
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// AUTO SAVE IMAGE / VIDEO REPORT
router.post("/", upload.single("file"), async (req, res) => {
  try {
    let file_url = "";
    let cloudinary_public_id = "";
    let cloudinary_resource_type = "image";
    let file_type = req.body.input_type || "image";

    if (req.file) {
      const isVideo = req.file.mimetype.startsWith("video");

      cloudinary_resource_type = isVideo ? "video" : "image";
      file_type = isVideo ? "video" : "image";

      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        cloudinary_resource_type
      );

      file_url = uploadResult.secure_url;
      cloudinary_public_id = uploadResult.public_id;
    }

    const report = await Report.create({
      input_type: file_type,
      file_type,
      file_url,
      cloudinary_public_id,
      cloudinary_resource_type,

      pothole_count: Number(req.body.pothole_count || 0),
      severity: req.body.severity || "None",
      damage_percentage: Number(req.body.damage_percentage || 0),

      traffic: req.body.traffic || "",
      zone: req.body.zone || "",
      camera_distance: req.body.camera_distance || "",

      latitude: req.body.latitude || "",
      longitude: req.body.longitude || "",

      potholes: req.body.potholes ? JSON.parse(req.body.potholes) : [],
    });

    res.status(201).json({
      message: "Report saved successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save report",
      error: error.message,
    });
  }
});

// GET ALL REPORTS
router.get("/", protect, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    });
  }
});

// DELETE REPORT
router.delete("/:id", protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.cloudinary_public_id) {
      await cloudinary.uploader.destroy(report.cloudinary_public_id, {
        resource_type: report.cloudinary_resource_type || "image",
      });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete report",
      error: error.message,
    });
  }
});

export default router;