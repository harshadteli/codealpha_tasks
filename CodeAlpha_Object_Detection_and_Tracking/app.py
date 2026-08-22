import streamlit as st
import cv2
import tempfile
import numpy as np
from ultralytics import YOLO
import os
from PIL import Image
import av
from streamlit_webrtc import webrtc_streamer, VideoProcessorBase, RTCConfiguration, WebRtcMode

class YOLOVideoProcessor(VideoProcessorBase):
    def __init__(self):
        self.model = None
        self.conf_threshold = 0.25
        self.tracker_type = "bytetrack.yaml"
        self.selected_class_ids = None

    def recv(self, frame: av.VideoFrame) -> av.VideoFrame:
        # Convert the input frame to a numpy array (BGR representation)
        image = frame.to_ndarray(format="bgr24")
        
        # Run YOLO inference & tracking if model is available
        if self.model is not None:
            results = self.model.track(
                source=image,
                conf=self.conf_threshold,
                persist=True,
                tracker=self.tracker_type,
                classes=self.selected_class_ids,
                verbose=False
            )
            annotated_frame = results[0].plot()
        else:
            annotated_frame = image
            
        # Return the processed frame
        return av.VideoFrame.from_ndarray(annotated_frame, format="bgr24")

# Page configuration
st.set_page_config(
    page_title="TrackVision AI - Object Detection & Tracking",
    page_icon="👁️",
    layout="wide"
)

# Custom CSS for a clean, Google-like interface
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Roboto:wght@300;400;500&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Google Sans', 'Roboto', sans-serif;
    }
    
    .google-title {
        font-family: 'Google Sans', sans-serif;
        font-size: 2.8rem;
        font-weight: 700;
        margin-bottom: 0.1rem;
        letter-spacing: -0.5px;
    }
    .google-subtitle {
        font-family: 'Roboto', sans-serif;
        font-size: 1.05rem;
        color: #5F6368;
        margin-bottom: 1.8rem;
        font-weight: 400;
    }
    .color-blue { color: #4285F4; }
    .color-red { color: #EA4335; }
    .color-yellow { color: #FBBC05; }
    .color-green { color: #34A853; }
    
    .google-card {
        background-color: #FFFFFF;
        border: 1px solid #DADCE0;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
    }
    
    .stTabs [data-baseweb="tab-list"] {
        gap: 24px;
    }
    .stTabs [data-baseweb="tab"] {
        height: 50px;
        white-space: pre-wrap;
        font-family: 'Google Sans', sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: #5F6368;
    }
    .stTabs [aria-selected="true"] {
        color: #1A73E8 !important;
    }
    </style>
""", unsafe_allow_html=True)

# App Title & Subtitle styled like Google's logo/products
st.markdown('<h1 class="google-title"><span class="color-blue">T</span><span class="color-red">r</span><span class="color-yellow">a</span><span class="color-blue">c</span><span class="color-green">k</span><span class="color-blue">V</span><span class="color-red">i</span><span class="color-yellow">s</span><span class="color-green">i</span><span class="color-red">o</span><span class="color-blue">n</span> <span class="color-green">AI</span> 👁️</h1>', unsafe_allow_html=True)
st.markdown('<p class="google-subtitle">Real-Time Object Detection & Tracking System powered by YOLO11</p>', unsafe_allow_html=True)

# Helper function to cache model loading
@st.cache_resource
def load_yolo_model(model_name):
    # If the model weight file doesn't exist, it will auto-download
    return YOLO(model_name)

# Sidebar configurations
st.sidebar.markdown("### ⚙️ Tracking Configuration")

# Model Selection
model_options = {
    "YOLO11 Nano (Fastest, CPU friendly)": "yolo11n.pt",
    "YOLO11 Small (Balanced)": "yolo11s.pt",
    "YOLOv8 Nano (Legacy, Lightweight)": "yolov8n.pt",
    "YOLOv8 Small (Legacy, Balanced)": "yolov8s.pt"
}
selected_model_display = st.sidebar.selectbox(
    "Select Model Weight",
    options=list(model_options.keys()),
    index=0
)
model_name = model_options[selected_model_display]

# Inform user if model needs downloading
if not os.path.exists(model_name):
    st.sidebar.info(f"ℹ️ Weights for {model_name} will be downloaded on first run.")

# Load the model
try:
    model = load_yolo_model(model_name)
    model_classes = model.names  # dict of class id to class name
    class_list = sorted(list(model_classes.values()))
except Exception as e:
    st.sidebar.error(f"Error loading model: {e}")
    model = None
    class_list = []

# Tracker Type Selection
tracker_type = st.sidebar.selectbox(
    "Choose Tracker",
    options=["bytetrack.yaml", "botsort.yaml"],
    index=0,
    help="ByteTrack is extremely fast and lightweight. BoT-SORT is highly accurate but slower."
)

# Confidence Slider
conf_threshold = st.sidebar.slider(
    "Confidence Threshold",
    min_value=0.0,
    max_value=1.0,
    value=0.25,
    step=0.05,
    help="Minimum prediction confidence score to track an object."
)

# Class Filter Option
if class_list:
    selected_classes = st.sidebar.multiselect(
        "Filter Objects (Leave empty to track all)",
        options=class_list,
        default=None,
        help="Select specific classes you want the model to track (e.g. person, car)."
    )
    # Map class name strings back to YOLO integer IDs
    selected_class_ids = [k for k, v in model_classes.items() if v in selected_classes]
    if not selected_class_ids:
        selected_class_ids = None  # None tracks all classes
else:
    selected_class_ids = None

# Tab Layout
tab_upload, tab_webcam = st.tabs(["📁 Video Upload Mode (Render / Local)", "📷 Webcam Mode (Localhost Only)"])

# ----------------- VIDEO UPLOAD MODE -----------------
with tab_upload:
    st.header("Upload Video File")
    st.write("Upload a video and let YOLO perform detection and tracking. You can visualize the results in real-time and download the tracked video afterwards.")
    
    uploaded_video = st.file_uploader(
        "Choose an MP4, AVI, MOV or MKV file...",
        type=["mp4", "avi", "mov", "mkv"],
        help="Upload the raw video file here."
    )
    
    if uploaded_video is not None:
        # Create temp files to store input and output videos
        tfile = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        tfile.write(uploaded_video.read())
        tfile.close()
        
        # Read video properties
        cap = cv2.VideoCapture(tfile.name)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Guard rails for incorrect metadata
        if fps <= 0 or np.isnan(fps):
            fps = 25.0
        if total_frames <= 0:
            total_frames = 1
            
        st.success(f"Successfully loaded video: `{uploaded_video.name}`")
        st.write(f"📊 **Resolution:** {width}x{height} | 🎬 **FPS:** {fps:.2f} | 🎞️ **Total Frames:** {total_frames}")
        
        # Let user run the tracking
        start_tracking = st.button("🚀 Start Object Tracking", key="start_video_tracking")
        
        if start_tracking:
            if model is None:
                st.error("Model is not loaded. Please verify configuration.")
            else:
                progress_bar = st.progress(0.0)
                status_placeholder = st.empty()
                video_placeholder = st.empty()
                
                # Create output temp file
                out_tfile = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
                out_path = out_tfile.name
                out_tfile.close()
                
                # Setup video writer
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                out_writer = cv2.VideoWriter(out_path, fourcc, fps, (width, height))
                
                frame_count = 0
                
                try:
                    while cap.isOpened():
                        ret, frame = cap.read()
                        if not ret:
                            break
                        
                        # YOLO Tracking
                        results = model.track(
                            source=frame,
                            conf=conf_threshold,
                            persist=True,
                            tracker=tracker_type,
                            classes=selected_class_ids,
                            verbose=False
                        )
                        
                        # Plot bounding boxes and IDs
                        # results[0].plot() returns BGR image
                        annotated_frame = results[0].plot()
                        
                        # Write frame to video
                        out_writer.write(annotated_frame)
                        
                        # Convert to RGB for Streamlit rendering
                        annotated_frame_rgb = cv2.cvtColor(annotated_frame, cv2.COLOR_BGR2RGB)
                        
                        # Stream the frame in real time
                        video_placeholder.image(
                            annotated_frame_rgb,
                            caption="Processing Frame...",
                            use_container_width=True
                        )
                        
                        frame_count += 1
                        progress = min(frame_count / total_frames, 1.0)
                        progress_bar.progress(progress)
                        status_placeholder.markdown(f"⏳ **Status:** Processing frame `{frame_count}/{total_frames}` ({int(progress*100)}%)")
                    
                    status_placeholder.success("🎉 Tracking Complete! Preparing download...")
                    
                except Exception as ex:
                    st.error(f"An error occurred during video processing: {ex}")
                finally:
                    # Clean up OpenCV files
                    cap.release()
                    out_writer.release()
                
                # Create a download button for the processed file
                try:
                    with open(out_path, "rb") as out_file:
                        st.download_button(
                            label="📥 Download Tracked Video",
                            data=out_file,
                            file_name=f"tracked_{uploaded_video.name}",
                            mime="video/mp4"
                        )
                except Exception as ex:
                    st.error(f"Error preparing download: {ex}")
                
                # Delete temporary files
                try:
                    os.unlink(tfile.name)
                    os.unlink(out_path)
                except Exception:
                    pass

# ----------------- WEBCAM MODE (STREAMLIT-WEBRTC) -----------------
with tab_webcam:
    st.header("Webcam Detection & Tracking")
    st.write("Stream your camera feed directly from your browser (Mobile or PC) to the YOLO model running on the server using secure WebRTC.")
    st.info("💡 **Mobile & Render Compatible:** This mode works everywhere, including mobile browsers, as long as the page is served over **HTTPS** (Render provides this automatically).")
    
    if model is None:
        st.error("Model is not loaded. Please verify configuration in the sidebar.")
    else:
        # Configuration for Google STUN servers to bypass NATs/firewalls (essential for mobile/cellular networks)
        RTC_CONFIGURATION = RTCConfiguration(
            {"iceServers": [{"urls": ["stun:stun.l.google.com:19302"]}]}
        )
        
        ctx = webrtc_streamer(
            key="yolo-tracking-webrtc",
            mode=WebRtcMode.SENDRECV,
            rtc_configuration=RTC_CONFIGURATION,
            video_processor_factory=YOLOVideoProcessor,
            media_stream_constraints={"video": True, "audio": False},
            async_processing=True,
        )

        if ctx.video_processor:
            # Sync Streamlit UI parameters with the WebRTC frame processing thread
            ctx.video_processor.model = model
            ctx.video_processor.conf_threshold = conf_threshold
            ctx.video_processor.tracker_type = tracker_type
            ctx.video_processor.selected_class_ids = selected_class_ids
