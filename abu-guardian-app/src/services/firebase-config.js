import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración personal de Firebase (desde la consola)
const firebaseConfig = {
  apiKey: "AIzaSyBMDqVbqwKdUtAXhIGgkKZF8N-6wcDc0vk",
  authDomain: "abu-guardian-proyecto.firebaseapp.com",
  projectId: "abu-guardian-proyecto",
  storageBucket: "abu-guardian-proyecto.firebasestorage.app",
  messagingSenderId: "362992821684",
  appId: "1:362992821684:web:34c03db3f703acebbdfee1"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios que usaremos en la aplicación.
export const auth = getAuth(app);
export const db = getFirestore(app);
