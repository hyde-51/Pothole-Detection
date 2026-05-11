import os
import re
import json
import shutil
import tempfile
import traceback
import subprocess
from typing import Any, Dict, List

import cv2
from fastapi import APIRouter, UploadFile, File, HTTPException
from cloudinary import uploader

import app.core.cloudinary_config
from app.core.model_loader import yolo_model

router = APIRouter(prefix="/api/pothole", tags=["Video Pothole Detection"])

YOLO_CONF = float(os.getenv("YOLO_CONF", "0.25"))

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/x-matroska",
}


def severity_from_ratio(ratio_percent: float) -> str:
    if ratio_percent < 1:
        return "Low"
    if ratio_percent < 5:
        return "Medium"
    return "High"


def extract_location_from_video(video_path: str):
    try:
        cmd = [
            "ffprobe",
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            video_path,
        ]

        output = subprocess.check_output(cmd)
        metadata = json.loads(output.decode("utf-8"))

        tags = metadata.get("format", {}).get("tags", {})

     
     

        location = (
            tags.get("location")
            or tags.get("location-eng")
        )

        

        if location:
            # Example:
            # +19.9771+079.8214/

            match = re.match(
                r"([+-]\d+\.\d+)([+-]\d+\.\d+)/?",
                location,
            )

            if match:
                lat = float(match.group(1))
                lon = float(match.group(2))

                return {
                    "latitude": str(lat),
                    "longitude": str(lon),
                    "google_maps_link": f"https://www.google.com/maps?q={lat},{lon}",
                    "source": "video_metadata",
                }

    except Exception as e:
        print("Video GPS extraction error:", e)

    return {
        "latitude": None,
        "longitude": None,
        "google_maps_link": None,
        "source": None,
    }

def convert_to_browser_mp4(input_path: str) -> str:
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        output_path = tmp.name

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        input_path,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        output_path,
    ]

    process = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
    )

    if process.returncode != 0:
        print("FFmpeg error:", process.stderr)
        raise Exception("FFmpeg conversion failed.")

    return output_path


def upload_video_to_cloudinary(video_path: str, folder: str):
    try:
        result = uploader.upload(
            video_path,
            resource_type="video",
            folder=folder,

            # IMPORTANT
            eager=[
                {
                    "format": "mp4",
                    "video_codec": "h264",
                }
            ],

            eager_async=True,
        )

        return {
            "cloudinary_url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "upload_success": True,
            "error": None,
        }

    except Exception as e:
        print("Cloudinary video upload error:", e)

        return {
            "cloudinary_url": None,
            "public_id": None,
            "upload_success": False,
            "error": str(e),
        }


def analyze_video(video_path: str) -> Dict[str, Any]:
   

    gps_location = extract_location_from_video(video_path)
   

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise Exception("Failed to open uploaded video.")

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    fps = cap.get(cv2.CAP_PROP_FPS)

    if not fps or fps <= 0:
        fps = 25.0

    if width <= 0 or height <= 0:
        raise Exception("Invalid video resolution.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp_raw:
        raw_output_path = tmp_raw.name

    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    writer = cv2.VideoWriter(raw_output_path, fourcc, fps, (width, height))

    if not writer.isOpened():
        raise Exception("Failed to create temporary annotated video.")

    processed_frames = 0
    frames_with_potholes = 0
    total_pothole_boxes = 0
    max_damage = 0.0
    pothole_frames: List[Dict[str, Any]] = []

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        processed_frames += 1

        results = yolo_model.predict(
            source=frame,
            conf=YOLO_CONF,
            verbose=False,
        )

        r = results[0]
        frame_detections = []

        if r.boxes is not None and len(r.boxes) > 0:
            for box in r.boxes:
                cls_id = int(box.cls[0])
                confidence = float(box.conf[0])
                class_name = str(r.names[cls_id]).lower()

                if len(r.names) == 1:
                    class_name = "pothole"

                if "pothole" not in class_name:
                    continue

                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())

                box_w = max(0, x2 - x1)
                box_h = max(0, y2 - y1)
                area = box_w * box_h
                frame_area = width * height
                damage_ratio = (area / frame_area) * 100 if frame_area else 0
                severity = severity_from_ratio(damage_ratio)

                frame_detections.append({
                    "class_name": class_name,
                    "confidence": round(confidence, 4),
                    "severity": severity,
                    "damage_percentage": round(damage_ratio, 4),
                    "bbox": {
                        "x1": x1,
                        "y1": y1,
                        "x2": x2,
                        "y2": y2,
                    },
                })

                total_pothole_boxes += 1
                max_damage = max(max_damage, damage_ratio)

        if frame_detections:
            frames_with_potholes += 1
            pothole_frames.append({
                "frame_number": processed_frames,
                "detections": frame_detections,
            })

        # YOLO built-in annotated frame
        annotated_frame = r.plot()
        writer.write(annotated_frame)

    cap.release()
    writer.release()

    converted_path = convert_to_browser_mp4(raw_output_path)

  
    annotated_upload = upload_video_to_cloudinary(
        converted_path,
        folder="pothole_ai/videos/annotated",
    )

    for path in [raw_output_path, converted_path]:
        try:
            os.remove(path)
        except OSError:
            pass



    return {
        "final_verdict": "pothole_found"
        if total_pothole_boxes > 0
        else "no_pothole_found",

        "gps_location": gps_location,

        "analysis": {
            "has_pothole": total_pothole_boxes > 0,
            "total_pothole_boxes": total_pothole_boxes,
            "frames_with_potholes": frames_with_potholes,
            "total_frames_checked": processed_frames,
            "total_frames_in_video": total_frames,
            "fps": round(float(fps), 2),
            "max_damage_percentage": round(max_damage, 2),
            "severity": severity_from_ratio(max_damage),
        },

        "annotated_video": annotated_upload,
        "pothole_frames": pothole_frames,
    }


@router.post("/video-analyze")
async def analyze_video_route(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Only MP4, MOV, AVI, WEBM, and MKV videos are allowed. Received: {file.content_type}",
        )

    temp_path = None

    try:
      

        suffix = os.path.splitext(file.filename or "")[1].lower()
        if suffix not in [".mp4", ".mov", ".avi", ".webm", ".mkv"]:
            suffix = ".mp4"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
            shutil.copyfileobj(file.file, temp)
            temp_path = temp.name

        result = analyze_video(temp_path)

        return {
            "success": True,
            "message": "Video processed successfully",
            "result": result,
        }

    except HTTPException:
        raise

    except Exception as e:

        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if temp_path:
            try:
                os.remove(temp_path)
            except OSError:
                pass