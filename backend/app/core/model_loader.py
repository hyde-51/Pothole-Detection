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


cnn_model = tf.keras.models.load_model(CNN_MODEL_PATH)


# =========================
# Load YOLO Model
# =========================


yolo_model = YOLO(YOLO_MODEL_PATH)



# =========================
# Export Models
# =========================
__all__ = ["cnn_model", "yolo_model"]