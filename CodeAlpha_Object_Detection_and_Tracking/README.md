# TrackVision AI — Real-Time Object Detection & Tracking System

TrackVision AI is a lightweight, web-based computer vision application designed to perform real-time object detection and tracking on uploaded videos or local webcams. It uses the state-of-the-art **YOLO11** (and legacy YOLOv8) models via the Ultralytics framework, with **ByteTrack** and **BoT-SORT** trackers for identity tracking across frames.

The interface is built with **Streamlit** and is fully ready for deployment on **Render** (using CPU-only configurations).

Visit at https://trackai-md3g.onrender.com/

---

## 🌟 Key Features
- **Lightweight Technical Stack:** Powered by Python 3.11+, YOLO11 (nano/small), and OpenCV.
- **Dynamic Model Selection:** Choose between YOLO11 and YOLOv8 models in the sidebar. The class filter updates dynamically based on the selected model.
- **Advanced Object Tracking:** Integrates ByteTrack and BoT-SORT to assign unique tracking IDs to detected objects.
- **Dual Processing Modes:**
  1. **Video Upload Mode:** Works anywhere (Localhost & Render). Upload a video, watch it process in real-time, and download the annotated version.
  2. **Webcam Mode:** Works on Localhost. Uses your local camera feed for real-time tracking.
- **Render Ready:** Leverages `opencv-python-headless` to run successfully on headless server environments without missing GUI dependency errors.

---

## 💻 Local Setup and Installation

Follow these steps to run the application on your computer:

### 1. Clone the Repository
Clone or download this project folder to your local machine:
```bash
git clone <your-repo-url>
cd CodeAlpha_Object_Detection_and_Tracking
```

### 2. Create a Virtual Environment
Create and activate a virtual environment to manage dependencies cleanly:
- **Windows:**
  ```bash
  python -m venv venv
  venv\Scripts\activate
  ```
- **macOS/Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

### 3. Install Dependencies
Install all requirements from the `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### 4. Run the Streamlit App
Start the local server:
```bash
streamlit run app.py
```
This will open the application in your default web browser (usually at `http://localhost:8501`).

---

## 🚀 Deployment to Render

To host this project for free on [Render](https://render.com/), follow these steps:

### 1. Push to GitHub
Make sure your project files (`app.py`, `requirements.txt`, and `.gitignore`) are committed and pushed to a GitHub repository.

### 2. Create a New Web Service on Render
1. Sign in to your **Render Dashboard**.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing this project.

### 3. Service Configuration
During the configuration wizard, use the following settings:
- **Name:** `trackvision-ai` (or any name you prefer)
- **Region:** Choose a region closest to you
- **Branch:** `main` (or your active branch)
- **Runtime:** `Python 3` (or `Python 3.11` if available)
- **Build Command:**
  ```bash
  pip install -r requirements.txt
  ```
- **Start Command:**
  ```bash
  streamlit run app.py --server.port $PORT --server.address 0.0.0.0
  ```
  *(**Note:** Setting `--server.port $PORT` and `--server.address 0.0.0.0` is critical for Render to route external traffic to Streamlit).*
- **Plan:** **Free** (or Starter CPU instance)

---

## ⚙️ How It Works (Project Flow)
1. **Input:** You upload a video file or toggle your local webcam.
2. **OpenCV Processing:** OpenCV decodes frames sequentially from the input stream.
3. **YOLO Detection:** YOLO11/YOLOv8 runs detection on each frame.
4. **Tracking Algorithm:** ByteTrack/BoT-SORT correlates boxes across consecutive frames and assigns unique IDs to track movement.
5. **Visualization & Output:** Bounding boxes, labels, and tracking IDs are drawn on the frame and displayed instantly on the Streamlit dashboard. In Video Mode, the results are compiled and downloadable as a `.mp4` file.
