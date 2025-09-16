import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegistroView from '../views/RegistroView.vue'
import DashboardView from '../views/DashboardView.vue'
import BienvenidaView from '../views/BienvenidaView.vue'
import AdminDashboardView from '../views/AdminDashboardView.vue'
import GestionUsuariosView from '../views/GestionUsuariosView.vue'
import PerfilView from '../views/PerfilView.vue'
import HistorialView from '../views/HistorialView.vue'
import EstadisticasView from '../views/EstadisticasView.vue'
import GestionSujetosView from '../views/GestionSujetosView.vue'
import GestionDispositivosView from '../views/GestionDispositivosView.vue'
import { auth } from '@/services/firebase-config.js'

// Añade las rutas.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/registro',
      name: 'registro',
      component: RegistroView
    }, {
      path: '/bienvenida',
      name: 'bienvenida',
      component: BienvenidaView,
      meta: { requiresAuth: true }
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilView,
      meta: { requiresAuth: true }
    },
    {
      path: '/historial',
      name: 'historial',
      component: HistorialView,
      meta: { requiresAuth: true }
    },
    {
      path: '/estadisticas',
      name: 'estadisticas',
      component: EstadisticasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true } // <-- La marcamos como ruta protegida
    },
    {
      path: '/admin',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/usuarios',
      name: 'gestion-usuarios',
      component: GestionUsuariosView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/sujetos',
      name: 'gestion-sujetos',
      component: GestionSujetosView,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/dispositivos',
      name: 'gestion-dispositivos',
      component: GestionDispositivosView,
      meta: { requiresAuth: true }
    }
         ]
})

// GUARDIA DE NAVEGACIÓN
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const currentUser = auth.currentUser;

  if (requiresAuth && !currentUser) {
    // Si la ruta requiere autenticación y no hay usuario, redirige al login.
    next('/');
  } else {
    // Si no, permite el acceso.
    next();
  }
});

export default router
