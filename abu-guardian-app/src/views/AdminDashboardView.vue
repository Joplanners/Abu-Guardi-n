<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { db } from '@/services/firebase-config.js'
import { collection, getDocs, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'

const totalUsuarios = ref(0)
const dispositivosOnline = ref(0)
const ingresosHoy = ref(0)
const actividadSistema = ref([])
const cargando = ref(true)

// Creamos una variable para cada listener en tiempo real
let unsubscribeActividad = null;
let unsubscribeIngresos = null;
let unsubscribeUsuarios = null;

onMounted(() => {
  try {
    // Listener para total de usuarios
    const qUsuarios = query(collection(db, "usuarios"));
    unsubscribeUsuarios = onSnapshot(qUsuarios, (querySnapshot) => {
      totalUsuarios.value = querySnapshot.size;
    });

    // Carga inicial de dispositivos online (sin listener en tiempo real)
    const qDispositivos = query(collection(db, "dispositivos"), where("estado", "==", "online"));
    getDocs(qDispositivos).then(querySnapshot => {
      dispositivosOnline.value = querySnapshot.size;
    });


    // Listener para actividad reciente
    const qRegistros = query(collection(db, "registros_sistema"), orderBy("timeStamp", "desc"), limit(5));
    unsubscribeActividad = onSnapshot(qRegistros, (querySnapshot) => {
      const registrosTemp = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.timeStamp && data.timeStamp.seconds) {
          const fecha = new Date(data.timeStamp.seconds * 1000).toLocaleString('es-CL');
          registrosTemp.push(`${fecha} - ${data.detalles} (Usuario: ${data.usuarioId || 'Sistema'})`);
        }
      });
      actividadSistema.value = registrosTemp;
    });

    // Listener para ingresos de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const qIngresos = query(collection(db, "registros_sistema"), where("timeStamp", ">=", hoy), where("detalles", "==", "El usuario ha iniciado sesión."));
    unsubscribeIngresos = onSnapshot(qIngresos, (querySnapshot) => {
      ingresosHoy.value = querySnapshot.size;
    });

  } catch (error) {
    console.error("Error al cargar los datos del dashboard:", error);
  } finally {
    cargando.value = false;
  }
});

// Limpiamos los listeners al desmontar el componente
onUnmounted(() => {
  if (unsubscribeActividad) unsubscribeActividad();
  if (unsubscribeIngresos) unsubscribeIngresos();
  if (unsubscribeUsuarios) unsubscribeUsuarios();
});
</script>

<template>
  <div>
    <AdminNavbar />
    <main class="admin-content">
      <div v-if="cargando" class="loading-message">
        Cargando datos del dashboard...
      </div>

      <div v-else>
        <section class="quick-stats">
          <div class="stat-item">
            <p>Total usuarios</p>
            <span>{{ totalUsuarios }}</span>
          </div>
          <div class="stat-item">
            <p>Dispositivos Online</p>
            <span>{{ dispositivosOnline }}</span>
          </div>
          <div class="stat-item">
            <p>Ingresos de hoy</p>
            <span>{{ ingresosHoy }}</span>
          </div>
        </section>

        <section class="activity-feed">
          <h2>Registro de actividad del sistema</h2>
          <ul v-if="actividadSistema.length > 0">
            <li v-for="(actividad, index) in actividadSistema" :key="index">
              {{ actividad }}
            </li>
          </ul>
          <p v-else>No hay registros de actividad para mostrar.</p>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-content {
  padding: 2rem;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

.loading-message {
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #555;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.stat-item p {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 1rem;
}

.stat-item span {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
}

.activity-feed {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.activity-feed h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.activity-feed ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-feed li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
  color: #555;
}

.activity-feed li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .admin-content {
    padding: 1rem;
  }
  .stat-item p {
    font-size: 0.9rem;
  }
  .stat-item span {
    font-size: 2rem;
  }
}
</style>
