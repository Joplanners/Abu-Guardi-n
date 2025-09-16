<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { db } from '@/services/firebase-config.js'
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { GoogleGenerativeAI } from '@google/generative-ai'

// ------------------ CONFIGURACIÓN DE LA API DE GEMINI ------------------
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// ---------------------------------------------------------

const Pose = window.Pose;
const Camera = window.Camera;
const drawConnectors = window.drawConnectors;
const drawLandmarks = window.drawLandmarks;
const POSE_CONNECTIONS = window.POSE_CONNECTIONS;

const videoElement = ref(null)
const canvasElement = ref(null)
const isCameraOn = ref(false)
let pose = null;
let camera = null;
let lastUploadTime = 0;
const uploadInterval = 5000;

// Función para generar una alerta y actualizar el estado del sujeto si es necesario
async function generarAlerta(tipo, severidad, sujetoId) {
  try {
    // Creamos el documento de la alerta
    await addDoc(collection(db, "alertas"), {
      timestamp: serverTimestamp(),
      tipo: tipo,
      severidad: severidad,
      sujetoId: sujetoId,
      estadoAlerta: "Enviada" // Estado inicial de la alerta
    });
    console.log(`¡ALERTA GENERADA: ${tipo}!`);

    // Si la alerta es crítica, actualizamos el estado del sujeto a "Alerta"
    if (severidad === 'CRITICA') {
      const sujetoDocRef = doc(db, "sujetos_monitoreados", sujetoId);
      await updateDoc(sujetoDocRef, {
        estadoActual: "Alerta"
      });
      console.log(`Estado del sujeto ${sujetoId} actualizado a "Alerta".`);
    }

    alert(`¡ALERTA DE ${severidad}! Se ha detectado: ${tipo}`);
  } catch (error) {
    console.error("Error al generar la alerta y actualizar estado:", error);
  }
}

async function analizarKeypoints(keypoints) {
  if (!keypoints) return;
  const relevantKeypoints = { nariz: keypoints[0], hombro_izquierdo: keypoints[11], hombro_derecho: keypoints[12], cadera_izquierda: keypoints[23], cadera_derecha: keypoints[24], rodilla_izquierda: keypoints[25], rodilla_derecha: keypoints[26], tobillo_izquierdo: keypoints[27], tobillo_derecho: keypoints[28], };
  const prompt = `Eres un sistema experto en análisis de biomecánica para detectar caídas en adultos mayores. Analiza los siguientes datos. Responde únicamente con la palabra "CAÍDA" si se cumplen los criterios de una emergencia, o "NORMAL" en cualquier otro caso. Datos de Keypoints: ${JSON.stringify(relevantKeypoints)}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    console.log("Respuesta de Gemini:", text);
    if (text.toUpperCase().includes("CAÍDA")) {
      await generarAlerta("Caída Detectada por IA", "CRITICA", "ID_de_Rosa");
    }
  } catch (error) {
    console.error("Error al contactar a la API de Gemini:", error);
  }
}
function onResults(results) {
  if (!canvasElement.value || !videoElement.value) return;
  const canvasCtx = canvasElement.value.getContext('2d');
  canvasElement.value.width = videoElement.value.videoWidth;
  canvasElement.value.height = videoElement.value.videoHeight;
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height);
  if (results.poseLandmarks) {
    drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
    drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});
  }
  canvasCtx.restore();
  const now = Date.now();
  if (results.poseLandmarks && (now - lastUploadTime > uploadInterval)) {
    lastUploadTime = now;
    const keypointsData = { timestamp: serverTimestamp(), keypoints: results.poseLandmarks, sujetoId: 'ID_de_Rosa', dispositivoId: 'CAM01' };
    try {
      addDoc(collection(db, "movimientos"), keypointsData).then(() => {
          analizarKeypoints(results.poseLandmarks);
        });
    } catch (error) {
      console.error("Error al guardar keypoints: ", error);
    }
  }
}
onMounted(() => {
    if (typeof Pose === 'function') {
        pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
        pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        pose.onResults(onResults);
    } else {
        console.error("MediaPipe Pose no se ha cargado todavía.");
    }
});
async function toggleCamara() {
  if (!pose || typeof Camera === 'undefined') {
    alert("Las herramientas de MediaPipe aún no están listas.");
    return;
  }
  if (isCameraOn.value) {
    if (camera) { await camera.stop(); camera = null; }
    const canvasCtx = canvasElement.value.getContext('2d');
    canvasCtx.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height);
    isCameraOn.value = false;
  } else {
    camera = new Camera(videoElement.value, { onFrame: async () => { if (videoElement.value && videoElement.value.readyState === 4) { await pose.send({image: videoElement.value}); } }, width: 640, height: 480 });
    await camera.start();
    isCameraOn.value = true;
  }
}
onUnmounted(() => { if (camera) { camera.stop(); } });
</script>

<template>
  <div>
    <AdminNavbar />
    <main class="contenido-vista">
      <div class="header">
        <h1>Gestión de Dispositivos y Monitoreo</h1>
        <button @click="toggleCamara" :class="isCameraOn ? 'btn-peligro' : 'btn-primario'">
          {{ isCameraOn ? 'Apagar Monitoreo' : 'Iniciar Monitoreo' }}
        </button>
      </div>
      <p>Desde aquí se activará el monitoreo en tiempo real.</p>

      <div class="video-container">
        <video ref="videoElement" autoplay playsinline></video>
        <canvas ref="canvasElement" class="output_canvas"></canvas>
      </div>
    </main>
  </div>
</template>

<style scoped>
.contenido-vista {
  padding: 2rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
h1 {
  margin: 0;
}
.video-container {
  margin-top: 1.5rem;
  width: 100%;
  max-width: 640px;
  background-color: #000;
  border: 1px solid #ddd;
  position: relative;
}
video {
  width: 100%;
  height: auto;
  display: block;
}
.output_canvas {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
button {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primario {
  background-color: #28a745;
  color: white;
}
.btn-peligro {
  background-color: #dc3545;
  color: white;
  }

</style>
