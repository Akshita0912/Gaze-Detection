# 👁️ Gaze Detection System

A real-time gaze and head-pose detection web app built with **JavaScript**, **MediaPipe FaceMesh**, and the browser’s **WebRTC** API.  
It identifies if you’re looking straight, left, right, up, down, blinking, or turning your head.

![Demo Preview](assets/demo.gif) <!-- replace with your own screenshot or gif -->

---

## ✨ Features
- **Real-Time Gaze Tracking** – Detects head and eye direction instantly.
- **Blink Detection** – Identifies when eyes are closed or blinking.
- **Screen Focus Monitoring** – Shows if the user is looking at the screen.
- **Browser-Only** – No backend; runs entirely client-side.
- **Minimal & Stylish UI** – Dark theme with glowing accents.

---

## 📂 Project Structure
├── index.html # Main webpage layout

├── style.css # Styling and animations

├── app.js # Gaze detection logic

└── README.md # Documentation


---

## ⚙️ How It Works
1. **Camera Access** – Prompts user for webcam access.
2. **Face Landmark Detection** – Uses MediaPipe FaceMesh to find 468 facial keypoints.
3. **Direction & Blink Analysis** – Calculates ratios for gaze direction and eyelid movement.
4. **Live Status Display** – Updates gaze status in real time on screen and canvas.
