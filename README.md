# Pothole-Detection

# 🛣️ Next-Gen Road Condition Analytics (Hybrid AI)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![YOLOv8](https://img.shields.io/badge/YOLOv8-00FFFF?style=for-the-badge&logo=ultralytics&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

An enterprise-grade, full-stack web application that deploys a **Hybrid Deep Learning Pipeline** to detect, map, and analyze infrastructure decay (potholes) in high-resolution imagery. 

Built as a Major Project, this system moves beyond simple bounding boxes by fusing multiple AI models, extracting real-world geospatial telemetry, and calculating automated material repair costs.

---

## ✨ Core Features

* **🧠 Hybrid AI Engine (WBF):** Integrates the high-speed recall of **YOLOv8** with the pinpoint precision of **Faster R-CNN** (PyTorch) using **Weighted Box Fusion (WBF)** to eliminate false positives and increase accuracy.
* **📍 Automated Geospatial Tagging:** Automatically extracts EXIF GPS metadata from uploaded images and plots the exact damage coordinates on an interactive map using Leaflet.js.
* **🚚 Material Estimation Math:** Proprietary algorithms calculate the physical surface area of the detected damage to estimate the exact kilograms of bitumen needed and the localized repair cost.
* **💅 Premium UI/UX:** A fully responsive, modern dashboard built with React and Tailwind CSS, featuring global dark/light mode toggles, floating UI components, and animated loading states.

---

## 🛠️ Technology Stack

### **Frontend**
* **React.js (Vite):** Lightning-fast component rendering.
* **Tailwind CSS:** Custom theme configuration, dark mode OLED styling, and responsive design.
* **Lucide React:** Clean, modern SVG iconography.
* **React-Leaflet:** Interactive map integration for telemetry data.

### **Backend & Machine Learning**
* **FastAPI (Python):** High-performance, asynchronous REST API.
* **YOLOv8 (Ultralytics):** Custom-trained (100 Epochs) for rapid edge-detection and object localization.
* **Faster R-CNN (PyTorch):** Custom-trained (50 Epochs) ResNet50 backbone for high-fidelity structural verification.
* **Ensemble-Boxes:** Implementation of Weighted Box Fusion logic.
* **OpenCV & ExifRead:** Image processing and metadata extraction.

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* CUDA Toolkit (Optional, but highly recommended for GPU acceleration)

### 1. Clone the Repository
```bash
git clone [https://github.com/hyde-51/Pothole-Detection.git](https://github.com/hyde-51/Pothole-Detection.git)
cd Pothole-Detection
