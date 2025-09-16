<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { auth, db } from '@/services/firebase-config.js'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import PasswordInput from '@/components/PasswordInput.vue'

const nombre = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const router = useRouter() // Para redirigir al usuario

// Función para registrar un nuevo usuario
async function registrarUsuario() {
  // Validación de coincidencia de contraseñas
  if (password.value !== passwordConfirm.value) {
    alert('Las contraseñas no coinciden.');
    return;
  }

  // Validación de largo de contraseña (y otras reglas)
  if (password.value.length < 10) {
    alert('La contraseña debe tener al menos 10 caracteres.');
    return;
  }
  if (!/[A-Z]/.test(password.value)) {
    alert('La contraseña debe contener al menos una letra mayúscula.');
    return;
  }
  if (!/[a-z]/.test(password.value)) {
    alert('La contraseña debe contener al menos una letra minúscula.');
    return;
  }
  if (!/\d/.test(password.value)) {
    alert('La contraseña debe contener al menos un número.');
    return;
  }
  if (!/[@$!%*?&]/.test(password.value)) {
    alert('La contraseña debe contener al menos un símbolo (@$!%*?&).');
    return;
  }

  // Si pasa todas las validaciones, intentar registrar
  try {
    const credenciales = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const usuario = credenciales.user;

    // Almacenamos los datos del usuario en Firestore
    await setDoc(doc(db, "usuarios", usuario.uid), {
      nombre: nombre.value,
      email: email.value,
      rol: 'familiar', // Se fuerza el rol a "familiar" por seguridad.
      sujetosAsignados: [],
      preferenciaNotificacion: 'Push',
      fechaCreacion: new Date()
    });
    alert(`¡Usuario ${nombre.value} registrado con éxito! Ahora puedes iniciar sesión.`);
    router.push('/');
  } catch (error) {
    console.error("Error al registrar el usuario:", error.message);
    alert("Error: " + error.code);
  }
}
</script>

<template>
  <div class="main-container">
    <div class="login-box">
      <form @submit.prevent="registrarUsuario">
        <h1>Crear Cuenta en Abu-Guardián</h1>

        <input type="text" placeholder="Nombre Completo" required v-model="nombre">
        <input type="email" placeholder="Correo Electrónico" required v-model="email" autocomplete="email">

        <PasswordInput v-model="password" />
        <PasswordInput v-model="passwordConfirm" placeholder="Repetir Contraseña" />

        <p class="password-rules">
          La contraseña debe tener al menos 10 caracteres, incluyendo una mayúscula, un número y un símbolo (@$!%*?&).
        </p>

        <button type="submit" id="register-button">Registrarme</button>

        <RouterLink to="/">¿Ya tienes una cuenta? Inicia Sesión</RouterLink>
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
input {
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
a {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}
.password-rules {
  font-size: 12px;
  color: #666;
  text-align: left;
  margin-top: -5px;
  margin-bottom: 15px;
}

#login-button {
  background-color: #007bff;
}

#register-button {
  background-color: #dc3545;
  transition: background-color 0.2s ease;
}

#register-button:hover {
  background-color: #c82333;
}

#register-button:active {
  background-color: #ccc;
}
@media (max-width: 480px) {
  .login-box {
    padding: 25px;
  }
  h1 {
    font-size: 24px;
  }
}
</style>
