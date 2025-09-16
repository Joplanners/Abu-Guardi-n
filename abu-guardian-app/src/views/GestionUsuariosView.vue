<script setup>
import { ref, onMounted } from 'vue'
import { db } from '@/services/firebase-config.js'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import AdminNavbar from '@/components/AdminNavbar.vue'

const usuarios = ref([])
const cargando = ref(true)

onMounted(async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "usuarios"));
    const usuariosTemp = [];
    querySnapshot.forEach((doc) => {
      usuariosTemp.push({ id: doc.id, ...doc.data() });
    });
    usuarios.value = usuariosTemp;
  } catch (error) {
    console.error("Error obteniendo los usuarios:", error);
  } finally {
    cargando.value = false;
  }
});

// El cerebro del botón "Guardar Rol"
async function guardarRol(usuario) {
  // Mostramos un mensaje de confirmación
  if (!confirm(`¿Estás seguro de que quieres cambiar el rol de ${usuario.nombre} a "${usuario.rol}"?`)) {
    // Si el usuario cancela, recargamos los datos originales para revertir el cambio visual
    window.location.reload();
    return;
  }

  try {
    // Creamos una referencia al documento específico del usuario que queremos actualizar
    const usuarioDocRef = doc(db, "usuarios", usuario.id);

    // Usamos updateDoc para cambiar solo el campo 'rol'
    await updateDoc(usuarioDocRef, {
      rol: usuario.rol
    });

    // Damos confirmación al administrador
    alert(`¡Rol de ${usuario.nombre} actualizado con éxito!`);

  } catch (error) {
    console.error("Error al actualizar el rol:", error);
    alert("Hubo un error al guardar los cambios. Inténtalo de nuevo.");
  }
}
</script>

<template>
  <AdminNavbar />
  <div class="gestion-container">
    <h1>Gestión de Usuarios</h1>
    <p>Aquí puedes ver y administrar todos los usuarios del sistema.</p>

    <div v-if="cargando" class="cargando">Cargando usuarios...</div>

    <div v-else>
      <!-- TABLA PARA ESCRITORIO -->
      <table class="tabla-escritorio">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Fecha de Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuarios" :key="usuario.id">
            <td>{{ usuario.nombre }}</td>
            <td>{{ usuario.email }}</td>
            <td>
              <select v-model="usuario.rol">
                <option value="familiar">Familiar</option>
                <option value="administrador">Administrador</option>
              </select>
            </td>
            <td>{{ new Date(usuario.fechaCreacion.seconds * 1000).toLocaleDateString() }}</td>
            <td>
              <button @click="guardarRol(usuario)" class="btn-secundario">Guardar Rol</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- TARJETAS PARA MÓVIL -->
      <div class="lista-tarjetas">
        <div v-for="usuario in usuarios" :key="usuario.id" class="tarjeta-usuario">
          <div class="info-principal">
            <strong>{{ usuario.nombre }}</strong>
            <span>{{ usuario.email }}</span>
          </div>
          <div class="info-secundaria">
            <div class="campo">
              <label>Rol:</label>
              <select v-model="usuario.rol">
                <option value="familiar">Familiar</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
            <div class="campo">
              <label>Creado:</label>
              <span>{{ new Date(usuario.fechaCreacion.seconds * 1000).toLocaleDateString() }}</span>
            </div>
          </div>
          <button @click="guardarRol(usuario)" class="btn-secundario">Guardar Rol</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.gestion-container {
  padding: 2rem;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);
}

h1 {
  margin-bottom: 1rem;
}

.cargando {
  font-size: 1.2rem;
  color: #888;
  text-align: center;
  padding: 2rem;
}

.tabla-escritorio {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.tabla-escritorio th, .tabla-escritorio td {
  border: 1px solid #ddd;
  padding: 0.8rem;
  text-align: left;
  vertical-align: middle;
}

.tabla-escritorio th {
  background-color: #f8f9fa;
  font-weight: bold;
}

.tabla-escritorio select {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.lista-tarjetas {
  display: none;
}

@media (max-width: 768px) {
  .tabla-escritorio {
    display: none;
  }
  .lista-tarjetas {
    display: block;
    margin-top: 1.5rem;
  }
}

.tarjeta-usuario {
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.info-principal {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}
.info-principal strong {
  font-size: 1.2rem;
}
.info-principal span {
  color: #666;
  font-size: 0.9rem;
}
.info-secundaria {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.campo {
  display: flex;
  flex-direction: column;
}
.campo label {
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.2rem;
}
.tarjeta-usuario button,
.tarjeta-usuario select {
  width: 100%;
  padding: 0.7rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.tarjeta-usuario button {
  cursor: pointer;
  font-weight: bold;
}
button {
     border: none;
     padding: 0.5rem 1rem;
     border-radius: 5px;
     cursor: pointer;
     font-weight: 500;
}
.btn-secundario {
    background-color: #28a645;
    color: white;
}
.btn-secundario:hover {
  background-color: #dc3545;
}
</style>
