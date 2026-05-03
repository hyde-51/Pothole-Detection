import cv2
import torch
import exifread
import numpy as np
import torchvision.transforms as T
from ultralytics import YOLO
from torchvision.models.detection import fasterrcnn_resnet50_fpn
from ensemble_boxes import weighted_boxes_fusion

class PotholeDetector:
    def __init__(self, yolo_model_path="models/pothole_yolov8_v2.pt", rcnn_model_path=None):
        
        self.yolo_model = YOLO(yolo_model_path)
        
        
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        
        self.rcnn_model = fasterrcnn_resnet50_fpn(pretrained=True) 
        if rcnn_model_path:
            self.rcnn_model.load_state_dict(torch.load(rcnn_model_path, map_location=self.device))
        
        self.rcnn_model.to(self.device)
        self.rcnn_model.eval() # Set to evaluation mode

    # Add this helper function directly INSIDE your class, right above extract_gps_data
    def _convert_to_degrees(self, value):
        """Converts raw EXIF rational fractions into standard Decimal coordinates"""
        d = float(value.values[0].num) / float(value.values[0].den)
        m = float(value.values[1].num) / float(value.values[1].den)
        s = float(value.values[2].num) / float(value.values[2].den)
        return d + (m / 60.0) + (s / 3600.0)

    def extract_gps_data(self, image_path):
        """Extracts and converts true GPS coordinates from an image."""
        try:
            import exifread
            with open(image_path, 'rb') as f:
                tags = exifread.process_file(f)
            
            # If the image has real GPS data, do the math!
            if 'GPS GPSLatitude' in tags and 'GPS GPSLongitude' in tags:
                lat = self._convert_to_degrees(tags['GPS GPSLatitude'])
                lon = self._convert_to_degrees(tags['GPS GPSLongitude'])
                
                # Correct for South/West hemispheres
                if 'GPS GPSLatitudeRef' in tags and tags['GPS GPSLatitudeRef'].values[0] != 'N':
                    lat = -lat
                if 'GPS GPSLongitudeRef' in tags and tags['GPS GPSLongitudeRef'].values[0] != 'E':
                    lon = -lon
                    
                return {
                    "latitude": str(lat), 
                    "longitude": str(lon)
                }
                
        except Exception as e:
            print(f"EXIF parsing error/missing data: {e}")

        # THE "REAL WORLD" BEHAVIOR
        # If no data is found, return None so the React frontend shows the warning UI
        return {
            "latitude": None, 
            "longitude": None
        }

    def estimate_size(self, box, image_width, image_height):
        """Estimates damage percentage based on bounding box."""
        x1, y1, x2, y2 = box
        pixel_area = (x2 - x1) * (y2 - y1)
        total_image_area = image_width * image_height
        
        damage_percentage = (pixel_area / total_image_area) * 100
        
        severity = "Low"
        if damage_percentage > 5: severity = "Medium"
        if damage_percentage > 15: severity = "High"
            
        return round(damage_percentage, 2), severity

    def analyze_image(self, image_path):
        """Runs the Hybrid YOLO + R-CNN pipeline with Weighted Box Fusion."""
        img = cv2.imread(image_path)
        img_h, img_w, _ = img.shape
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Extract GPS
        location = self.extract_gps_data(image_path)
        
        # ==========================================
        # MODEL 1: YOLOv8 (Fast, High Recall)
        # ==========================================
        yolo_results = self.yolo_model(image_path)[0]
        yolo_boxes, yolo_scores, yolo_labels = [], [], []
        
        for box in yolo_results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            # WBF requires coordinates normalized between 0 and 1
            yolo_boxes.append([x1/img_w, y1/img_h, x2/img_w, y2/img_h])
            yolo_scores.append(conf)
            yolo_labels.append(0) # 0 = Pothole

        # ==========================================
        # MODEL 2: Faster R-CNN (Slow, High Precision)
        # ==========================================
        # Transform image for PyTorch R-CNN
        transform = T.Compose([T.ToTensor()])
        img_tensor = transform(img_rgb).unsqueeze(0).to(self.device)
        
        rcnn_boxes, rcnn_scores, rcnn_labels = [], [], []
        with torch.no_grad():
            rcnn_preds = self.rcnn_model(img_tensor)[0]
            
            for i in range(len(rcnn_preds['boxes'])):
                conf = float(rcnn_preds['scores'][i])
                if conf > 0.3: # Only keep decent R-CNN guesses
                    x1, y1, x2, y2 = rcnn_preds['boxes'][i].tolist()
                    rcnn_boxes.append([x1/img_w, y1/img_h, x2/img_w, y2/img_h])
                    rcnn_scores.append(conf)
                    rcnn_labels.append(0)

        # ==========================================
        # WEIGHTED BOX FUSION (The Magic)
        # ==========================================
        # If we trust R-CNN more for precision, we can weight it higher: [1, 2]
        weights = [1, 1] 
        iou_thr = 0.15 # If boxes overlap by 50%, merge them
        skip_box_thr = 0.01

        boxes_list = [yolo_boxes, rcnn_boxes]
        scores_list = [yolo_scores, rcnn_scores]
        labels_list = [yolo_labels, rcnn_labels]

        # Only fuse if at least one model found something to prevent crashes
        if len(yolo_boxes) > 0 or len(rcnn_boxes) > 0:
            fused_boxes, fused_scores, fused_labels = weighted_boxes_fusion(
                boxes_list, scores_list, labels_list, 
                weights=weights, iou_thr=iou_thr, skip_box_thr=skip_box_thr
            )
        else:
            fused_boxes, fused_scores = [], []

        # ==========================================
        # FORMAT FOR REACT FRONTEND
        # ==========================================
        potholes = []
        for i, box in enumerate(fused_boxes):
            # Convert normalized WBF boxes back to percentages for React
            pct_left = round(box[0] * 100, 2)
            pct_top = round(box[1] * 100, 2)
            pct_width = round((box[2] - box[0]) * 100, 2)
            pct_height = round((box[3] - box[1]) * 100, 2)
            
            # Convert back to absolute pixels for the math function
            abs_box = (box[0]*img_w, box[1]*img_h, box[2]*img_w, box[3]*img_h)
            damage_pct, severity = self.estimate_size(abs_box, img_w, img_h)
            
            potholes.append({
                "bbox": {"left": pct_left, "top": pct_top, "width": pct_width, "height": pct_height},
                "confidence": round(float(fused_scores[i]), 2),
                "damage_percentage": damage_pct,
                "severity": severity,
                "detected_by": "Hybrid WBF" # Shows off the tech!
            })

        return {
            "status": "success",
            "gps_location": location,
            "total_potholes_detected": len(potholes),
            "potholes": potholes
        }