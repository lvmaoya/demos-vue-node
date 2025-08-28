<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.app-container {
  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-color);
  transition: var(--transition);
}
</style>
