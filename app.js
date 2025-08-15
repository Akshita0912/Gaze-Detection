const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 },
    audio: false,
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

function calculateMidpoint(p1, p2) {
  return [(p1.x + p2.x) / 2, (p1.y + p2.y) / 2];
}

function calculateDistance(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function detectGazeAndScreenFocus(faceLandmarks) {
  const leftEyeTop = faceLandmarks[159];
  const leftEyeBottom = faceLandmarks[145];
  const leftEyeInner = faceLandmarks[133];
  const leftEyeOuter = faceLandmarks[33];
  const leftPupil = calculateMidpoint(leftEyeTop, leftEyeBottom);

  const rightEyeTop = faceLandmarks[386];
  const rightEyeBottom = faceLandmarks[374];
  const rightEyeInner = faceLandmarks[362];
  const rightEyeOuter = faceLandmarks[263];
  const rightPupil = calculateMidpoint(rightEyeTop, rightEyeBottom);

  const leftEAR = calculateDistance(leftEyeTop, leftEyeBottom) / calculateDistance(leftEyeInner, leftEyeOuter);
  const rightEAR = calculateDistance(rightEyeTop, rightEyeBottom) / calculateDistance(rightEyeInner, rightEyeOuter);
  const averageEAR = (leftEAR + rightEAR) / 2;
  const EAR_THRESHOLD = 0.2;

  const leftGazeRatio = Math.abs(leftPupil[0] - leftEyeInner.x) / Math.abs(leftEyeOuter.x - leftEyeInner.x);
  const rightGazeRatio = Math.abs(rightPupil[0] - rightEyeInner.x) / Math.abs(rightEyeOuter.x - rightEyeInner.x);
  const averageGazeRatio = (leftGazeRatio + rightGazeRatio) / 2;

  const nose = faceLandmarks[1];
  const leftCheek = faceLandmarks[234];
  const rightCheek = faceLandmarks[454];
  const chin = faceLandmarks[152];
  const forehead = faceLandmarks[10];

  const faceTurnRatio = (nose.x - leftCheek.x) / (rightCheek.x - leftCheek.x);
  const verticalFaceRatio = (nose.y - forehead.y) / (chin.y - forehead.y);

  if (averageEAR < EAR_THRESHOLD) return "Eyes closed or blinking";
  if (faceTurnRatio < 0.4) return "Face turned left";
  if (faceTurnRatio > 0.6) return "Face turned right";
  if (verticalFaceRatio < 0.4) return "Face tilted up";
  if (verticalFaceRatio > 0.6) return "Face tilted down";
  if (averageGazeRatio < 0.4) return "Looking left";
  if (averageGazeRatio > 0.6) return "Looking right";
  return "Looking straight at screen";
}

async function startDetection() {
  const faceMesh = new FaceMesh({
    locateFile: (file) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.8,
    minTrackingConfidence: 0.8,
  });

  faceMesh.onResults((results) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const faceLandmarks = results.multiFaceLandmarks[0];
      const gazeStatus = detectGazeAndScreenFocus(faceLandmarks);
      status.textContent = `Status: ${gazeStatus}`;

      // Draw face landmarks
      for (const landmark of faceLandmarks) {
        ctx.beginPath();
        ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 2, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
      }

      // Optional: overlay status text on video
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(gazeStatus, 10, 30);
    } else {
      status.textContent = "Status: No face detected";
    }
  });

  await setupCamera();
  video.play();
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const processFrame = async () => {
    await faceMesh.send({ image: video });
    requestAnimationFrame(processFrame);
  };
  processFrame();
}

startDetection();
