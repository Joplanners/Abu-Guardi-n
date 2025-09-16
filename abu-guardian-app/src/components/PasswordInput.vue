<script setup>
import { ref } from 'vue'

// Permite que el componente reciba el v-model desde afuera
const model = defineModel()

// Variable para controlar si la contraseña se ve o no
const isVisible = ref(false)

function toggleVisibility() {
  isVisible.value = !isVisible.value
}
</script>

<template>
  <div class="password-wrapper">
    <input
      :type="isVisible ? 'text' : 'password'"
      placeholder="Contraseña"
      required
      v-model="model"
      autocomplete="current-password"
    >
    <button @click.prevent="toggleVisibility" class="toggle-button" type="button">
      <svg v-if="!isVisible" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
    </button>
  </div>
</template>

<style scoped>
.password-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 15px;
}
.password-wrapper input {
  width: 100%;
  padding: 12px;
  padding-right: 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 16px;
}
.toggle-button {
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  color: #888;
}
</style>
