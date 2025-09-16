<script setup>
import { ref, onMounted } from 'vue'
import FamiliarNavbar from '@/components/FamiliarNavbar.vue'
import { db, auth } from '@/services/firebase-config.js'
import { doc, getDoc } from 'firebase/firestore'

// Datos del sujeto monitoreado
const sujeto = ref(null)
const cargando = ref(true)

onMounted(async () => {
  const usuarioActual = auth.currentUser;
  if (usuarioActual) {
    const usuarioDocRef = doc(db, "usuarios", usuarioActual.uid);
    const usuarioDocSnap = await getDoc(usuarioDocRef);

    if (usuarioDocSnap.exists() && usuarioDocSnap.data().sujetosAsignados?.length > 0) {
      const sujetoId = usuarioDocSnap.data().sujetosAsignados[0];
      const sujetoDocRef = doc(db, "sujetos_monitoreados", sujetoId);
      const sujetoDocSnap = await getDoc(sujetoDocRef);
      if (sujetoDocSnap.exists()) {
        sujeto.value = sujetoDocSnap.data();
      }
    }
  }
  cargando.value = false;
});
</script>

<template>
  <div>
    <FamiliarNavbar :nombreSujeto="sujeto ? sujeto.nombreCompleto : 'Cargando...'" />
    <main class="contenido-vista">
      <h1>Ficha de {{ sujeto ? sujeto.nombreCompleto : '' }}</h1>

      <div v-if="cargando" class="cargando-mensaje">Cargando perfil...</div>

      <div v-else-if="sujeto" class="ficha-perfil">
        <div class="avatar-placeholder">
          <span>{{ sujeto.nombreCompleto.charAt(0) }}</span>
        </div>
        <div class="info-grupo">
          <label>Nombre Completo</label>
          <p>{{ sujeto.nombreCompleto }}</p>
        </div>
        <div class="info-grupo">
          <label>Edad</label>
          <p>{{ sujeto.edad }} años</p>
        </div>
        <div class="info-grupo">
          <label>Condiciones Médicas Relevantes</label>
          <p class="condiciones">{{ sujeto.condicionesMedicas || 'No especificadas' }}</p>
        </div>
      </div>

      <div v-else class="cargando-mensaje">No se pudo cargar la información del perfil.</div>
    </main>
  </div>
</template>

<style scoped>
.contenido-vista {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
.cargando-mensaje {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.ficha-perfil {
  margin-top: 1.5rem;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: #007bff;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
  font-weight: bold;
  margin: 0 auto 2rem auto;
}

.info-grupo {
  margin-bottom: 1.5rem;
  text-align: left;
}
.info-grupo label {
  display: block;
  font-weight: 500;
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 0.2rem;
}
.info-grupo p {
  font-size: 1.2rem;
  color: #333;
  margin: 0;
  padding-left: 0.5rem;
}
.info-grupo .condiciones {
  white-space: pre-wrap; /* Permite saltos de línea */
}
</style>
