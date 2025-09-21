<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  bannerImage: {
    type: String,
    required: false,
    default: '',
  },
});
</script>

<template>
  <div class="page-wrapper">
    <div v-if="bannerImage" class="banner-container">
      <img :src="bannerImage" :alt="`Banner para ${title}`" class="banner-image" />
    </div>

    <div class="actions-container">
      <slot name="actions"></slot>
    </div>

    <h1>{{ title }}</h1>
    
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  width: 100%;
}

.banner-container {
  width: 100%;
}

.banner-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

/* Solo añadimos un margen al contenedor de acciones */
.actions-container {
  margin-top: 16px;    /* Espacio arriba (debajo del banner) */
  margin-bottom: 16px; /* Espacio abajo (encima del título) */
}

h1 {
  margin-bottom: 20px;
}
</style>