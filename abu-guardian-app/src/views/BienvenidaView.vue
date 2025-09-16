<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const nombre = ref('')

// onMounted es un "gancho" que se ejecuta cuando el componente está listo
onMounted(() => {
  // Leemos el nombre que nos pasaron en la URL
  nombre.value = route.query.nombre || 'Usuario'

  // Creamos un temporizador para redirigir después de 3 segundos
  setTimeout(() => {
    router.push('/dashboard')
  }, 3000);
})
</script>

<template>
  <div class="welcome-container">
    <h1>¡Bienvenido a Abu-Guardián, {{ nombre }}!</h1>
    <p>Serás redirigido al panel principal en unos segundos...</p>
  </div>
</template>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: white;
  text-align: center;
  padding: 1rem;
}
h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}
p {
  font-size: 1.2rem;
  margin-top: 10px;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
  p {
    font-size: 1rem;
  }
}
</style>
