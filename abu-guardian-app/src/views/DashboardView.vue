<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import FamiliarNavbar from '@/components/FamiliarNavbar.vue'
import { auth, db } from '@/services/firebase-config.js'
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, updateDoc } from 'firebase/firestore'

const cargando = ref(true)
const mensaje = ref('')
const sujetoMonitoreado = ref(null)
const alertasRecientes = ref([])
const estadisticas = ref({ alertasHoy: 0, caidasMes: 0 })

let unsubscribeAlertas = null;
let unsubscribeSujeto = null;

// Función para marcar una alerta como resuelta
async function marcarComoResuelto(alertaId) {
  if (!sujetoMonitoreado.value) return;

  if (confirm("¿Estás seguro de que esta situación ha sido resuelta?")) {
    try {
      // Actualizamos el estado del sujeto de vuelta a "Normal"
      const sujetoDocRef = doc(db, "sujetos_monitoreados", sujetoMonitoreado.value.id);
      await updateDoc(sujetoDocRef, {
        estadoActual: "Normal"
      });

      // Actualizamos también la alerta para marcarla como resuelta
      const alertaDocRef = doc(db, "alertas", alertaId);
      await updateDoc(alertaDocRef, {
        estadoAlerta: "Resuelto"
      });

      console.log("Alerta y estado del sujeto actualizados.");
    } catch (error) {
      console.error("Error al resolver la alerta:", error);
      alert("Hubo un error al intentar resolver la alerta.");
    }
  }
}

onMounted(async () => {
  try {
    const usuarioActual = auth.currentUser;
    if (!usuarioActual) {
      mensaje.value = "Error: No se ha podido identificar al usuario."; return;
    }
    const usuarioDocRef = doc(db, "usuarios", usuarioActual.uid);
    const usuarioDocSnap = await getDoc(usuarioDocRef);
    if (!usuarioDocSnap.exists() || !usuarioDocSnap.data().sujetosAsignados?.length) {
      mensaje.value = "Aún no tienes un sujeto asignado. Contacta a un administrador."; return;
    }
    const primerSujetoId = usuarioDocSnap.data().sujetosAsignados[0];

    // Listener en tiempo real para el sujeto monitoreado
    const sujetoDocRef = doc(db, "sujetos_monitoreados", primerSujetoId);
    unsubscribeSujeto = onSnapshot(sujetoDocRef, (sujetoDoc) => {
      if (sujetoDoc.exists()) {
        sujetoMonitoreado.value = { id: sujetoDoc.id, ...sujetoDoc.data() };
      } else {
        mensaje.value = `Error: No se encontró el perfil del sujeto asignado (ID: ${primerSujetoId}).`;
      }
    });

    const q = query(collection(db, "alertas"), where("sujetoId", "==", primerSujetoId), orderBy("timestamp", "desc"));
    unsubscribeAlertas = onSnapshot(q, (querySnapshot) => {
      const alertasTemp = [];
      let alertasDeHoy = 0;
      const hoy = new Date().setHours(0, 0, 0, 0);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fechaAlerta = data.timestamp.toDate();
        alertasTemp.push({ id: doc.id, ...data, fechaFormateada: fechaAlerta.toLocaleString('es-CL') });
        if (fechaAlerta.getTime() >= hoy) alertasDeHoy++;
      });
      alertasRecientes.value = alertasTemp;
      estadisticas.value.alertasHoy = alertasDeHoy;
    });

  } catch (error) {
    console.error("Error al cargar el dashboard:", error);
    mensaje.value = "Ocurrió un error inesperado al cargar los datos.";
  } finally {
    cargando.value = false;
  }
});

onUnmounted(() => {
  if (unsubscribeAlertas) unsubscribeAlertas();
  if (unsubscribeSujeto) unsubscribeSujeto();
});
</script>

<template>
  <div class="dashboard-container">
    <FamiliarNavbar :nombreSujeto="sujetoMonitoreado ? sujetoMonitoreado.nombreCompleto : 'Cargando...'" />

    <main class="dashboard-content">
      <div v-if="cargando" class="mensaje-estado">Cargando datos...</div>
      <div v-else-if="mensaje" class="mensaje-estado">{{ mensaje }}</div>
      <template v-else-if="sujetoMonitoreado">
        <section class="status-card">
          <h2>Estado Actual de {{ sujetoMonitoreado.nombreCompleto }}</h2>
          <div class="status-indicator" :class="sujetoMonitoreado.estadoActual.toLowerCase()">
            {{ sujetoMonitoreado.estadoActual }}
          </div>
        </section>

        <section class="quick-stats">
        </section>

        <section class="activity-feed">
          <h2>Actividad Reciente</h2>
          <ul v-if="alertasRecientes.length > 0">
            <li v-for="alerta in alertasRecientes" :key="alerta.id" class="alerta-item">
              <span class="alerta-info">{{ alerta.fechaFormateada }}: {{ alerta.tipo }} - Severidad: {{ alerta.severidad }}</span>
              <!-- El botón aparece si la alerta es critica y no ha sido resuelta -->
              <button
                v-if="alerta.severidad === 'CRITICA' && alerta.estadoAlerta !== 'Resuelto'"
                @click="marcarComoResuelto(alerta.id)"
                class="btn-resolver"
              >
                Marcar como Resuelto
              </button>
            </li>
          </ul>
          <p v-else>No hay actividad reciente para mostrar.</p>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f0f2f5;
  color: #333;
}

.dashboard-content {
  padding: 2rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr 1fr;
}

.mensaje-estado {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
  background-color: white;
  border-radius: 8px;
  font-size: 1.2rem;
  color: #555;
}

.status-card, .quick-stats, .activity-feed {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.activity-feed {
  grid-column: 1 / -1;
}

.status-indicator {
  font-size: 2rem;
  font-weight: bold;
  padding: 1rem;
  border-radius: 5px;
  text-align: center;
  margin-top: 1rem;
  text-transform: capitalize;
}
.status-indicator.normal { background-color: #e8f5e9; color: #1b5e20; }
.status-indicator.alerta { background-color: #ffebee; color: #b71c1c; }

.stats-grid {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.stat-item {
  flex-grow: 1;
  text-align: center;
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
}

.stat-item p {
  margin: 0;
  color: #666;
}
.stat-item span {
  font-size: 3rem;
  font-weight: bold;
}
.activity-feed ul {
  list-style: none;
  padding: 0;
  margin-top: 1rem;
}

.alerta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #eee;
  gap: 1rem;
}

.alerta-info {
  flex-grow: 1;
}

.btn-resolver {
  background-color: #28a645;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 1rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .dashboard-content {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  .stats-grid {
    flex-direction: column;
  }
  .alerta-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .btn-resolver {
    margin-top: 0.5rem;
    margin-left: 0;
    width: 100%;
  }
}
</style>
