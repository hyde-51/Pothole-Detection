# Pothole Detection & Road Condition Analysis using AI

## Overview

Pothole Detection & Road Condition Analysis is an AI-powered system developed to automatically detect potholes and analyze road conditions using Deep Learning and Computer Vision techniques. The system uses a hybrid approach combining CNN (Convolutional Neural Network) and YOLOv8 models for accurate pothole detection from both images and videos.

The project helps in identifying damaged roads, calculating road damage percentage, generating annotated outputs with bounding boxes, and storing detailed reports for monitoring and analysis.

---

# Objectives

- Detect potholes from images and videos
- Analyze road damage severity
- Generate bounding boxes around potholes
- Extract GPS location from media metadata
- Store reports in admin dashboard
- Upload annotated media to Cloudinary
- Generate downloadable PDF/CSV reports

---

# Features

## Image Detection

- Upload road images
- CNN-based road classification
- YOLOv8 pothole detection
- Bounding box generation
- Severity classification
- Damage percentage calculation
- Annotated image generation
- GPS extraction from image metadata
- Cloudinary image upload

---

## Video Detection

- Upload road videos
- Frame-by-frame pothole detection
- YOLOv8 video analysis
- Bounding box generation on video frames
- Frames with potholes calculation
- Damage percentage estimation
- Severity analysis
- Annotated video generation
- Video metadata GPS extraction
- Cloudinary video upload

---

## Admin Dashboard

- View all saved reports
- Preview images and videos
- Download reports
- Delete reports
- Search and filter reports
- View severity levels
- Access GPS locations using Google Maps

---

# Technologies Used

## Frontend

- React.js
- Tailwind CSS
- Vite
- Axios
- jsPDF
- Lucide React

---

## AI Backend

- FastAPI
- Python
- OpenCV
- TensorFlow/Keras
- YOLOv8
- Pillow
- FFmpeg
- ExifRead

---

## Admin Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

---

# System Workflow

## Image Detection Workflow

1. User uploads image
2. Image is sent to FastAPI backend
3. CNN model classifies road condition
4. If pothole detected, YOLOv8 runs
5. Bounding boxes are generated
6. Road damage percentage is calculated
7. Severity level is determined
8. Annotated image is generated
9. Image uploaded to Cloudinary
10. Report saved to MongoDB
11. Admin dashboard displays report

---

## Video Detection Workflow

1. User uploads video
2. Video sent to FastAPI backend
3. Video processed frame-by-frame
4. YOLOv8 detects potholes
5. Bounding boxes generated on frames
6. Frames with potholes counted
7. Damage percentage calculated
8. Annotated video generated
9. FFmpeg converts video to MP4
10. Video uploaded to Cloudinary
11. Report saved in MongoDB
12. Admin dashboard displays results

---

# Severity Classification

| Damage Percentage | Severity |
|---|---|
| Less than 1% | Low |
| 1% to 5% | Medium |
| Greater than 5% | High |

---

# Project Architecture

```text
User Upload
     ↓
React Frontend
     ↓
FastAPI Backend
     ↓
CNN Classification
     ↓
YOLOv8 Detection
     ↓
Bounding Box Generation
     ↓
Cloudinary Upload
     ↓
MongoDB Storage
     ↓
Admin Dashboard


Folder Structure

Pothole-Detection/
│
├── frontend/
│
├── backend/
│
├── Admin/
│   ├── admin-frontend/
│   └── admin-backend/
└── README.md

Installation Steps
1. Clone Repository
git clone https://github.com/your-username/Pothole-Detection.git

cd Pothole-Detection

#Project Setup
npm install
pip install -r requirements.txt

npm run dev
http://localhost:5173


Admin Backend and Frontend Setup
cd Admin/admin-backend
cd Admin/admin-frontend


npm install

npm run dev


Environment Variables

Frontend .env
VITE_API_URL=http://localhost:8000
VITE_ADMIN_API=http://localhost:5000

Backend .env
MONGO_URI=""
DB_NAME=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

CNN_MODEL_PATH=
YOLO_MODEL_PATH=

CNN_THRESHOLD=0.50
YOLO_CONF=0.25
CNN_INPUT_SIZE=64

Admin Backend .env

MONGO_URI=
DB_NAME=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

ADMIN_EMAIL=
ADMIN_PASSWORD=
JWT_SECRET=

Required Python Libraries
pip install fastapi uvicorn tensorflow ultralytics opencv-python pillow exifread cloudinary python-multipart

FFmpeg Setup

Download FFmpeg and add the bin folder path to system environment variables.

Check installation:

ffmpeg -version

ffprobe -version

Cloudinary Setup
Create Cloudinary account
Copy Cloud Name
Copy API Key
Copy API Secret
Add credentials to .env
MongoDB Setup
Create MongoDB Atlas cluster
Create database user
Copy MongoDB connection string
Add connection string to .env

Example:

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/potholeDB


Output Generated

Image Output

Annotated pothole image
Severity level
Road damage percentage
GPS coordinates
Cloudinary image URL

Video Output

Annotated pothole video
Total pothole detections
Frames with potholes
Severity level
Damage percentage
GPS coordinates
Cloudinary video URL

Future Enhancements

Real-time camera detection
Drone-based inspection
Mobile application
Pothole depth estimation
Smart city integration
Automatic road complaint system



#License

This project is developed for educational and research purposes.