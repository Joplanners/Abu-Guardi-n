<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { auth } from '@/services/firebase-config.js'
import { signOut } from 'firebase/auth'

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
  <header class="admin-header">
    <h1>Panel de Administrador</h1>

    <!-- Botón de hamburguesa -->
    <button @click="isMenuOpen = !isMenuOpen" class="hamburger-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>

    <!-- Envolvemos la navegación para controlarla con 'isMenuOpen' -->
    <div class="nav-links" :class="{ 'is-open': isMenuOpen }">
      <nav>
        <RouterLink to="/admin">Dashboard</RouterLink>
        <RouterLink to="/admin/usuarios">Gestión de Usuarios</RouterLink>
        <RouterLink to="/admin/sujetos">Gestión de Sujetos</RouterLink>
        <RouterLink to="/admin/dispositivos">Dispositivos</RouterLink>
        <a href="#">Informes</a>
      </nav>
      <button @click="cerrarSesion" class="logout-button">Cerrar Sesión</button>
    </div>
  </header>
</template>

<style scoped>
.admin-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.admin-header h1 {
  font-size: 1.5rem;
}

.nav-links {
  display: flex;
  align-items: center;
}
.nav-links nav a {
  margin: 0 0.8rem;
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
  margin-left: 1rem;
}

/* El botón de hamburguesa está oculto en pantallas grandes */
.hamburger-icon {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
}

@media (max-width: 992px) {
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

  /* Cuando el menú está abierto, lo mostramos */
  .nav-links.is-open {
    display: flex;
  }

  .nav-links nav {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  /* El botón de logout ocupa todo el ancho */
  .logout-button {
    margin-left: 0;
    width: 100%;
  }

  /* Mostramos el botón de hamburguesa */
  .hamburger-icon {
    display: block;
  }
}
</style>
