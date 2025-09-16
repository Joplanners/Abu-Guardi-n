<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { auth } from '@/services/firebase-config.js'
import { signOut } from 'firebase/auth'

defineProps({
  nombreSujeto: String
})

const router = useRouter()

// Variable para saber si el menú está abierto o cerrado
const isMenuOpen = ref(false)

async function cerrarSesion() {
  try {
    await signOut(auth);
    router.push('/');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}
</script>

<template>
  <header class="dashboard-header">
    <RouterLink to="/dashboard" class="header-link">
      <h1>Estado de {{ nombreSujeto }}</h1>
    </RouterLink>
    <!-- Botón de hamburguesa -->
    <button @click="isMenuOpen = !isMenuOpen" class="hamburger-icon">
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>
    <!-- Envolvemos la navegación para controlarla con 'isMenuOpen' -->
    <div class="nav-links" :class="{ 'is-open': isMenuOpen }">
      <nav>
        <RouterLink to="/historial">Historial</RouterLink>
        <RouterLink to="/estadisticas">Estadísticas</RouterLink>
        <RouterLink to="/perfil">Mi Perfil</RouterLink>
      </nav>
      <button @click="cerrarSesion" class="logout-button">Cerrar Sesión</button>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.header-link {
  text-decoration: none;
  color: inherit;
}
.dashboard-header h1 {
  font-size: 1.2rem;
}

.nav-links {
  display: flex;
  align-items: center;
}
.nav-links nav a {
  margin: 0 1rem;
  color: #555;
  text-decoration: none;
  font-weight: 500;
}
.logout-button {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
}
.hamburger-icon {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
  }
  .nav-links {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    flex-direction: column;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    align-items: flex-start;
    gap: 1.5rem;
  }
  .nav-links.is-open {
    display: flex;
  }
  .nav-links nav {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  .logout-button {
    width: 100%;
  }
  .hamburger-icon {
    display: block;
  }
}
</style>
