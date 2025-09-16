<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/services/firebase-config.js'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import PasswordInput from '@/components/PasswordInput.vue'

const email = ref('')
const password = ref('')
const router = useRouter()

async function iniciarSesion() {
  try {
    // Autenticamos al usuario
    const credenciales = await signInWithEmailAndPassword(auth, email.value, password.value);
    const usuario = credenciales.user;

    // Buscamos el documento del usuario en Firestore para leer sus datos
    const docRef = doc(db, "usuarios", usuario.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const datosUsuario = docSnap.data();
      const nombreUsuario = datosUsuario.nombre;
      const rolUsuario = datosUsuario.rol;

      try {
        await addDoc(collection(db, "registros_sistema"), {
          timeStamp: serverTimestamp(), // La hora actual del servidor
          detalles: `El usuario ha iniciado sesión.`,
          usuarioId: nombreUsuario // Guardamos el nombre del usuario
        });
        console.log("Registro de inicio de sesión creado.");
      } catch (logError) {
        console.error("Error al crear el registro de actividad:", logError);
      }

      // Verificamos el rol y redirigimos
      if (rolUsuario === 'administrador') {
        router.push('/admin');
      } else {
        router.push({ name: 'bienvenida', query: { nombre: nombreUsuario } });
      }
    } else {
      console.error("No se encontraron datos de usuario en Firestore.");
      router.push('/dashboard');
    }

  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    alert("Error: " + error.message);
  }
}
</script>

<template>
  <div class="main-container">
    <div class="login-box">
      <form @submit.prevent="iniciarSesion">
        <h1>Abu-Guardián</h1>
        <input type="email" id="email" placeholder="Correo Electrónico" required v-model="email" autocomplete="email">
        <PasswordInput v-model="password" />
        <button type="submit" id="login-button">Iniciar Sesión</button>

        <div class="links-container">
          <RouterLink to="/registro">Crear una cuenta nueva</RouterLink>
          <RouterLink to="#">¿Olvidaste tu contraseña?</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 1rem;
}

.login-box {
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  text-align: center;
  width: 100%;
  max-width: 380px;
}

h1 {
  color: #1c1e21;
  font-size: 28px;
  margin-bottom: 20px;
}

input, select {
  display: block;
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  margin-bottom: 15px;
}

#login-button {
  background-color: #007bff;
}
form[
  action="/registro"
  ]
  button {
    background-color: #28a745;
  }


a {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}

.links-container {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
}

.password-rules {
  font-size: 12px;
  color: #666;
  text-align: left;
  margin-top: -5px;
  margin-bottom: 15px;
}

@media (max-width: 480px) {
  .login-box {
    padding: 25px;
  }
  h1 {
    font-size: 24px;
  }
  .links-container {
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
}
</style>
