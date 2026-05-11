import os
import tempfile
from io import BytesIO
from typing import Any, Dict, List

import exifread
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from PIL import Image, ImageDraw
from cloudinary import uploader

import app.core.cloudinary_config
from app.core.model_loader import cnn_model, yolo_model

router = APIRouter(prefix="/api/pothole", tags=["Image Pothole Detection"])

CNN_INPUT_SIZE = int(os.getenv("CNN_INPUT_SIZE", "64"))
CNN_THRESHOLD = float(os.getenv("CNN_THRESHOLD", "0.50"))
YOLO_CONF = float(os.getenv("YOLO_CONF", "0.25"))

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}


def severity_from_ratio(ratio_percent: float) -> str:
    if ratio_percent < 1:
        return "Low"
    if ratio_percent < 5:
        return "Medium"
    return "High"


def convert_to_degrees(value):
    d = float(value.values[0].num) / float(value.values[0].den)
    m = float(value.values[1].num) / float(value.values[1].den)
    s = float(value.values[2].num) / float(value.values[2].den)
    return d + (m / 60.0) + (s / 3600.0)


def extract_gps_from_image(image_bytes: bytes) -> Dict[str, Any]:
    try:
        tags = exifread.process_file(BytesIO(image_bytes), details=False)

        if "GPS GPSLatitude" in tags and "GPS GPSLongitude" in tags:
            lat = convert_to_degrees(tags["GPS GPSLatitude"])
            lon = convert_to_degrees(tags["GPS GPSLongitude"])

            if "GPS GPSLatitudeRef" in tags and tags["GPS GPSLatitudeRef"].values[0] != "N":
                lat = -lat

            if "GPS GPSLongitudeRef" in tags and tags["GPS GPSLongitudeRef"].values[0] != "E":
                lon = -lon

            return {
                "latitude": str(lat),
                "longitude": str(lon),
                "google_maps_link": f"https://www.google.com/maps?q={lat},{lon}",
            }

    except Exception as e:
        print("GPS extraction error:", e)

    return {"latitude": None, "longitude": None, "google_maps_link": None}


def preprocess_cnn(image: Image.Image) -> np.ndarray:
    image = image.resize((CNN_INPUT_SIZE, CNN_INPUT_SIZE))
    arr = np.array(image).astype("float32") / 255.0
    return np.expand_dims(arr, axis=0)


def run_cnn(image: Image.Image) -> Dict[str, Any]:
    x = preprocess_cnn(image)
    pred = cnn_model.predict(x, verbose=0)

    if pred.shape[-1] == 1:
        pothole_prob = float(pred[0][0])
        normal_prob = 1.0 - pothole_prob
        is_pothole = pothole_prob >= CNN_THRESHOLD

        return {
            "is_pothole": is_pothole,
            "class_name": "pothole" if is_pothole else "normal_road",
            "confidence": round(pothole_prob if is_pothole else normal_prob, 4),
            "probabilities": {
                "normal_road": round(normal_prob, 4),
                "pothole": round(pothole_prob, 4),
            },
        }

    probs = pred[0].astype(float).tolist()
    best_idx = int(np.argmax(probs))
    class_names = ["normal_road", "pothole"]
    class_name = class_names[best_idx] if best_idx < len(class_names) else f"class_{best_idx}"

    return {
        "is_pothole": class_name == "pothole",
        "class_name": class_name,
        "confidence": round(float(probs[best_idx]), 4),
        "probabilities": {
            class_names[i] if i < len(class_names) else f"class_{i}": round(float(p), 4)
            for i, p in enumerate(probs)
        },
    }


def upload_bytes_to_cloudinary(image_bytes: bytes, folder: str) -> Dict[str, Any]:
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
        tmp.write(image_bytes)
        temp_path = tmp.name

    try:
        result = uploader.upload(temp_path, resource_type="image", folder=folder)
        return {
            "cloudinary_url": result.get("secure_url"),
            "secure_url": result.get("secure_url"),
            "public_id": result.get("public_id"),
            "upload_success": True,
            "error": None,
        }

    except Exception as e:
        print("Cloudinary upload error:", e)
        return {
            "cloudinary_url": None,
            "secure_url": None,
            "public_id": None,
            "upload_success": False,
            "error": str(e),
        }

    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass


def annotate_boxes(image: Image.Image, detections: List[Dict[str, Any]]) -> Image.Image:
    draw = ImageDraw.Draw(image)

    for det in detections:
        x1 = det["bbox"]["x1"]
        y1 = det["bbox"]["y1"]
        x2 = det["bbox"]["x2"]
        y2 = det["bbox"]["y2"]

        label = f'Pothole {det["confidence"]:.2f}'
        draw.rectangle([x1, y1, x2, y2], outline="red", width=4)

        text_y = max(0, y1 - 24)
        draw.rectangle([x1, text_y, x1 + 150, text_y + 24], fill="red")
        draw.text((x1 + 4, text_y + 4), label, fill="white")

    return image


def run_yolo(image: Image.Image) -> Dict[str, Any]:
    image_np = np.array(image)
    height, width = image_np.shape[:2]
    image_area = float(width * height)

    results = yolo_model.predict(
        source=image_np,
        conf=YOLO_CONF,
        imgsz=640,
        verbose=False,
    )

    r = results[0]

    detections: List[Dict[str, Any]] = []
    total_pothole_area = 0.0

    if r.boxes is not None and len(r.boxes) > 0:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = str(r.names[cls_id]).lower()

            if len(r.names) == 1:
                class_name = "pothole"

            if "pothole" not in class_name:
                continue

            x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())

            box_w = max(0.0, x2 - x1)
            box_h = max(0.0, y2 - y1)
            area = box_w * box_h
            ratio = (area / image_area) * 100 if image_area else 0.0

            detections.append({
                "class_name": "pothole",
                "confidence": round(confidence, 4),
                "bbox": {
                    "x1": round(x1, 2),
                    "y1": round(y1, 2),
                    "x2": round(x2, 2),
                    "y2": round(y2, 2),
                    "left": round((x1 / width) * 100, 2),
                    "top": round((y1 / height) * 100, 2),
                    "width": round((box_w / width) * 100, 2),
                    "height": round((box_h / height) * 100, 2),
                },
                "width": round(box_w, 2),
                "height": round(box_h, 2),
                "area": round(area, 2),
                "area_ratio_percent": round(ratio, 4),
                "severity": severity_from_ratio(ratio),
            })

            total_pothole_area += area

    road_damage_percent = (total_pothole_area / image_area) * 100 if image_area else 0.0

    annotated_image = annotate_boxes(image.copy(), detections)
    buffer = BytesIO()
    annotated_image.save(buffer, format="JPEG", quality=95)

    annotated_upload = upload_bytes_to_cloudinary(
        buffer.getvalue(),
        folder="pothole_ai/annotated_images",
    )

    return {
        "total_potholes": len(detections),
        "total_pothole_area": round(total_pothole_area, 2),
        "road_damage_percent": round(min(road_damage_percent, 100.0), 4),
        "detections": detections,
        "annotated_image": annotated_upload,
    }


def empty_yolo_result():
    return {
        "total_potholes": 0,
        "total_pothole_area": 0,
        "road_damage_percent": 0,
        "detections": [],
        "annotated_image": None,
    }


def analyze_pothole_image(image_bytes: bytes) -> Dict[str, Any]:
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    gps_location = extract_gps_from_image(image_bytes)

    
    cnn_result = run_cnn(image)

    

    if not cnn_result["is_pothole"]:
      

        original_upload = upload_bytes_to_cloudinary(
            image_bytes,
            folder="pothole_ai/original_images",
        )

    

        return {
            "cnn": cnn_result,
            "yolo": {
                "total_potholes": 0,
                "total_pothole_area": 0,
                "road_damage_percent": 0,
                "detections": [],
            },
            "gps_location": gps_location,
            "final_verdict": "normal_road",
            "stored_image_type": "original",
            "image_to_store": original_upload,
            "original_image": original_upload,
            "annotated_image": None,
        }



    yolo_result = run_yolo(image)



    final_verdict = (
        "pothole_detected"
        if yolo_result["total_potholes"] > 0
        else "cnn_positive_yolo_zero_boxes"
    )

    annotated_upload = yolo_result["annotated_image"]



    return {
        "cnn": cnn_result,
        "yolo": {
            "total_potholes": yolo_result["total_potholes"],
            "total_pothole_area": yolo_result["total_pothole_area"],
            "road_damage_percent": yolo_result["road_damage_percent"],
            "detections": yolo_result["detections"],
        },
        "gps_location": gps_location,
        "final_verdict": final_verdict,
        "stored_image_type": "annotated",
        "image_to_store": annotated_upload,
        "original_image": None,
        "annotated_image": annotated_upload,
    }


@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if file.content_type.lower() not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Only JPG, JPEG, PNG, and WEBP images are allowed. Received: {file.content_type}",
        )

    try:
        image_bytes = await file.read()

        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty image file.")

        result = analyze_pothole_image(image_bytes)

        return {
            "success": True,
            "message": "Image processed successfully",
            "result": result,
        }

    except HTTPException:
        raise

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))