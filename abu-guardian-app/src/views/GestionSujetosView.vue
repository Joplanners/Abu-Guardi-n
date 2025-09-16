<script setup>
import { ref, onMounted } from 'vue'
import AdminNavbar from '@/components/AdminNavbar.vue'
import { db } from '@/services/firebase-config.js'
import { collection, getDocs, addDoc, query, where, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

const sujetos = ref([])
const cargando = ref(true)

// Lista de familiares para asignaciones
const familiares = ref([])

// Variables para el formulario de nuevo sujeto
const mostrandoFormulario = ref(false)
const nuevoSujeto = ref({
  nombreCompleto: '',
  edad: null,
  condicionesMedicas: '',
  estadoActual: 'Normal'
})

// Variables para el modal de asignación de familiares
const mostrandoModalAsignacion = ref(false)
const sujetoSeleccionado = ref(null) // Para saber a qué sujeto estamos asignando usuarios
const usuariosAsignadosIds = ref([]) // Para los checkboxes del modal

// Función para cargar todos los sujetos monitoreados
async function obtenerSujetos() {
  const querySnapshot = await getDocs(collection(db, "sujetos_monitoreados"));
  const sujetosTemp = [];
  querySnapshot.forEach((doc) => {
    sujetosTemp.push({ id: doc.id, ...doc.data() });
  });
  sujetos.value = sujetosTemp;
}

// Función para cargar solo los usuarios con rol 'familiar'
async function obtenerFamiliares() {
  const q = query(collection(db, "usuarios"), where("rol", "==", "familiar"));
  const querySnapshot = await getDocs(q);
  const familiaresTemp = [];
  querySnapshot.forEach((doc) => {
    familiaresTemp.push({ id: doc.id, ...doc.data() });
  });
  familiares.value = familiaresTemp;
}

// Función para añadir un nuevo sujeto
async function anadirSujeto() {
  if (!nuevoSujeto.value.nombreCompleto || !nuevoSujeto.value.edad) {
    alert('El nombre y la edad son obligatorios.');
    return;
  }
  try {
    const docRef = await addDoc(collection(db, "sujetos_monitoreados"), nuevoSujeto.value);
    sujetos.value.push({ id: docRef.id, ...nuevoSujeto.value });
    alert('¡Sujeto añadido con éxito!');
    mostrandoFormulario.value = false;
    nuevoSujeto.value = { nombreCompleto: '', edad: null, condicionesMedicas: '', estadoActual: 'Normal' };
  } catch (error) {
    console.error("Error al añadir sujeto:", error);
    alert('Hubo un error al guardar el nuevo sujeto.');
  }
}

// Función para abrir el modal de asignación y preparar los datos
async function abrirModalAsignacion(sujeto) {
  sujetoSeleccionado.value = sujeto;
  // Obtenemos los familiares que ya están asignados a este sujeto
  const asignadosActualmente = familiares.value
    .filter(f => f.sujetosAsignados && f.sujetosAsignados.includes(sujeto.id))
    .map(f => f.id);

  usuariosAsignadosIds.value = asignadosActualmente;
  mostrandoModalAsignacion.value = true;
}

// Función para guardar las asignaciones de familiares al sujeto
async function guardarAsignaciones() {
  if (!sujetoSeleccionado.value) return;

  const sujetoId = sujetoSeleccionado.value.id;
  const promesasDeActualizacion = [];

  // Revisamos cada familiar y actualizamos su lista de sujetosAsignados según corresponda
  for (const familiar of familiares.value) {
    const familiarDocRef = doc(db, "usuarios", familiar.id);
    const estaAsignadoAhora = familiar.sujetosAsignados && familiar.sujetosAsignados.includes(sujetoId);
    const deberiaEstarAsignado = usuariosAsignadosIds.value.includes(familiar.id);

    if (deberiaEstarAsignado && !estaAsignadoAhora) {
      // Si debe estar y no lo está lo añadimos
      promesasDeActualizacion.push(updateDoc(familiarDocRef, {
        sujetosAsignados: arrayUnion(sujetoId)
      }));
    } else if (!deberiaEstarAsignado && estaAsignadoAhora) {
      // Si no debe estar y sí lo está lo quitamos
      promesasDeActualizacion.push(updateDoc(familiarDocRef, {
        sujetosAsignados: arrayRemove(sujetoId)
      }));
    }
  }

  try {
    await Promise.all(promesasDeActualizacion);
    alert(`Asignaciones para ${sujetoSeleccionado.value.nombreCompleto} guardadas con éxito.`);
    // Refrescamos la lista de familiares para reflejar los cambios
    await obtenerFamiliares();
  } catch (error) {
    console.error("Error al guardar asignaciones:", error);
    alert("Hubo un error al guardar las asignaciones.");
  } finally {
    mostrandoModalAsignacion.value = false;
  }
}


// Cuando el componente se monta, cargamos todo lo necesario
onMounted(async () => {
  await Promise.all([
    obtenerSujetos(),
    obtenerFamiliares()
  ]);
  cargando.value = false;
});
</script>

<template>
  <div>
    <AdminNavbar />
    <main class="contenido-vista">
      <div class="header">
        <h1>Gestión de Sujetos Monitoreados</h1>
        <button @click="mostrandoFormulario = !mostrandoFormulario" class="btn-primario">
          {{ mostrandoFormulario ? 'Cancelar' : 'Añadir Nuevo Sujeto' }}
        </button>
      </div>
      <p>Crea, visualiza y edita los perfiles de los adultos mayores en el sistema.</p>
      <form v-if="mostrandoFormulario" @submit.prevent="anadirSujeto" class="formulario-nuevo">
        <h3>Nuevo Sujeto Monitoreado</h3>
        <input type="text" v-model="nuevoSujeto.nombreCompleto" placeholder="Nombre Completo" required>
        <input type="number" v-model="nuevoSujeto.edad" placeholder="Edad" required>
        <textarea v-model="nuevoSujeto.condicionesMedicas" placeholder="Condiciones médicas relevantes"></textarea>
        <button type="submit" class="btn-primario">Guardar Sujeto</button>
      </form>

      <div v-if="cargando" class="cargando">Cargando...</div>
      <div v-else class="tabla-container">
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Edad</th>
              <th>Condiciones Médicas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sujeto in sujetos" :key="sujeto.id">
              <td>{{ sujeto.nombreCompleto }}</td>
              <td>{{ sujeto.edad }}</td>
              <td>{{ sujeto.condicionesMedicas }}</td>
              <td class="columna-acciones">
                <button @click="abrirModalAsignacion(sujeto)" class="btn-secundario">Asignar</button>
                <button class="btn-editar">Editar</button>
                <button class="btn-peligro">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </main>
    <!-- Modal para asignar familiares -->
    <div v-if="mostrandoModalAsignacion" class="modal-overlay">
      <div class="modal-contenido">
        <h3>Asignar Familiares a {{ sujetoSeleccionado?.nombreCompleto }}</h3>
        <p>Selecciona los familiares que podrán monitorear a esta persona.</p>
        <div class="lista-familiares">
          <div v-for="familiar in familiares" :key="familiar.id" class="item-familiar">
            <input
              type="checkbox"
              :id="familiar.id"
              :value="familiar.id"
              v-model="usuariosAsignadosIds"
            >
            <label :for="familiar.id">{{ familiar.nombre }} ({{ familiar.email }})</label>
          </div>
        </div>
        <div class="modal-acciones">
          <button @click="mostrandoModalAsignacion = false" class="btn-peligro">Cancelar</button>
          <button @click="guardarAsignaciones" class="btn-primario">Guardar Cambios</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contenido-vista {
  padding: 2rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
h1 {
  margin: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

th, td {
  border: 1px solid #ddd;
  padding: 0.8rem;
  text-align: left;
  vertical-align: middle;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
  white-space: nowrap;
}
.cargando {
  font-size: 1.2rem;
  color: #888;
  text-align: center;
  padding: 2rem;
}
button {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}
.btn-primario {
  background-color: #007bff;
  color: white;
}
.btn-editar {
  background-color: #ffc107;
  color: black;
}
.btn-secundario {
  background-color: #28a645;
  color: white;
}
.btn-peligro {
  background-color: #dc3545;
  color: white;
}
.columna-acciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.formulario-nuevo {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formulario-nuevo h3 {
  margin-top: 0;
}

.formulario-nuevo input, .formulario-nuevo textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
}
.formulario-nuevo button {
  align-self: flex-start;
 }
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem; }

.modal-contenido {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.modal-contenido h3 {
  margin-top: 0;
}
.lista-familiares {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 1rem;
  margin: 1rem 0;
}
.item-familiar {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
}
.item-familiar input {
  margin-right: 1rem;
}
.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.tabla-container {
  overflow-x: auto;
  width: 100%;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .contenido-vista {
    padding: 1rem;
  }
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .modal-contenido {
    padding: 1.5rem;
  }
  .modal-acciones {
    flex-direction: column-reverse;
  }
  .modal-acciones button {
    width: 100%;
    margin-right: 0;
  }
}
</style>
