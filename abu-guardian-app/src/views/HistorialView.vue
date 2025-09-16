<script setup>
import { ref, onMounted } from 'vue';
import FamiliarNavbar from '@/components/FamiliarNavbar.vue';
import { db, auth } from '@/services/firebase-config.js';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const sujeto = ref(null);
const historialAlertas = ref([]);
const cargando = ref(true);

onMounted(async () => {
  const usuarioActual = auth.currentUser;
  if (usuarioActual) {
    const usuarioDoc = await getDoc(doc(db, "usuarios", usuarioActual.uid));
    if (usuarioDoc.exists() && usuarioDoc.data().sujetosAsignados?.length > 0) {
      const sujetoId = usuarioDoc.data().sujetosAsignados[0];
      const sujetoDoc = await getDoc(doc(db, "sujetos_monitoreados", sujetoId));
      if (sujetoDoc.exists()) {
        sujeto.value = sujetoDoc.data();

        // Cargar historial de alertas para el sujeto monitoreado
        const q = query(collection(db, "alertas"), where("sujetoId", "==", sujetoId), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        historialAlertas.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
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
      <h1>Historial de Eventos</h1>
      <div v-if="cargando">Cargando historial...</div>
      <div v-else-if="historialAlertas.length > 0" class="lista-historial">
        <div v-for="alerta in historialAlertas" :key="alerta.id" class="item-historial" :class="alerta.severidad.toLowerCase()">
          <div class="icono">
             <!-- Icono simple  -->
            <svg v-if="alerta.tipo.includes('Caída')" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div class="detalles">
            <strong>{{ alerta.tipo }}</strong>
            <span>Severidad: {{ alerta.severidad }}</span>
          </div>
          <div class="fecha">
            {{ new Date(alerta.timestamp.seconds * 1000).toLocaleString('es-CL') }}
          </div>
        </div>
      </div>
      <div v-else>No hay eventos en el historial para mostrar.</div>
    </main>
  </div>
</template>

<style scoped>
.contenido-vista {
  padding: 2rem;
}
.lista-historial {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.item-historial {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border-left: 5px solid;
}
.item-historial.critica {
  border-left-color: #dc3545;
}
.item-historial.media {
  border-left-color: #ffc107;
}
.item-historial.baja {
  border-left-color: #17a2b8;
}
.icono {
  margin-right: 1rem;
}
.detalles {
   flex-grow: 1;
   display: flex;
   flex-direction: column;
  }
.detalles strong {
  font-size: 1.1rem;
}
.detalles span {
  color: #666;
  font-size: 0.9rem;
}
.fecha {
  color: #888;
  font-size: 0.9rem;
  }

</style>
