import os
from dotenv import load_dotenv
import tensorflow as tf
from ultralytics import YOLO

# Load .env variables
load_dotenv()

# =========================
# Environment Variables
# =========================
CNN_MODEL_PATH = os.getenv("CNN_MODEL_PATH", "models/model.h5")
YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "models/best.pt")

# =========================
# Load CNN Model
# =========================
print("Loading CNN model...")

cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH)

print("CNN model loaded successfully.")

# =========================
# Load YOLO Model
# =========================
print("Loading YOLO model...")

yolo_model = YOLO(YOLO_MODEL_PATH)

print("YOLO model loaded successfully.")

# =========================
# Export Models
# =========================
__all__ = ["cnn_model", "yolo_model"]