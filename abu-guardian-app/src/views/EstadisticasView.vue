<script setup>
import { ref, onMounted, computed } from 'vue';
import FamiliarNavbar from '@/components/FamiliarNavbar.vue';
import { db, auth } from '@/services/firebase-config.js';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const sujeto = ref(null);
const todasLasAlertas = ref([]);
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

        const q = query(collection(db, "alertas"), where("sujetoId", "==", sujetoId));
        const querySnapshot = await getDocs(q);
        todasLasAlertas.value = querySnapshot.docs.map(doc => doc.data());
      }
    }
  }
  cargando.value = false;
});

// Estadísticas calculadas
const totalAlertas = computed(() => todasLasAlertas.value.length);
const totalCaidas = computed(() => todasLasAlertas.value.filter(a => a.tipo.includes('Caída')).length);
const totalInactividad = computed(() => todasLasAlertas.value.filter(a => a.tipo.includes('Inactividad')).length);

</script>

<template>
  <div>
    <FamiliarNavbar :nombreSujeto="sujeto ? sujeto.nombreCompleto : 'Cargando...'" />
    <main class="contenido-vista">
      <h1>Estadísticas de Movilidad</h1>
      <div v-if="cargando">Cargando estadísticas...</div>
      <div v-else class="grid-estadisticas">
        <div class="tarjeta-stat">
          <p>Total de Alertas</p>
          <span>{{ totalAlertas }}</span>
        </div>
        <div class="tarjeta-stat">
          <p>Caídas Detectadas</p>
          <span>{{ totalCaidas }}</span>
        </div>
        <div class="tarjeta-stat">
          <p>Alertas de Inactividad</p>
          <span>{{ totalInactividad }}</span>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.contenido-vista { padding: 2rem; }
.grid-estadisticas {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}
.tarjeta-stat {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
}
.tarjeta-stat p {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 1.2rem;
}
.tarjeta-stat span {
  font-size: 4rem;
  font-weight: bold;
  color: #007bff;
}
</style>
