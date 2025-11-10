<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

let originalOverflow = "";
let originalMargin = "";

onMounted(() => {
  window.scrollTo(0, 0);
  originalOverflow = document.body.style.overflow;
  originalMargin = document.body.style.margin;
  document.body.style.overflow = "hidden";
  document.body.style.margin = "0";
});

onBeforeUnmount(() => {
  document.body.style.overflow = originalOverflow;
  document.body.style.margin = originalMargin;
});

function goBack() {
  router.push({ name: "hardware" });
}
</script>

<template>
  <div class="bpwin-wrapper">
    <header class="bpwin-header">
      <button class="back-button" @click="goBack" type="button">
        ← Volver a Hardware
      </button>
    </header>
    <div class="bpwin-container">
      <div class="aspect-ratio-box">
        <iframe
          src="https://drive.google.com/file/d/10vXBxoBUDShMpjf_XsOvjK2Y-57no61v/view?usp=sharing"
          class="bpwin-iframe"
          title="Google Sheets Report"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bpwin-wrapper {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #2c3e50;
  z-index: 100;
}

.bpwin-header {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  padding: 16px 20px;
  background-color: #566782;
}

.back-button {
  padding: 8px 16px;
  font-size: 0.9em;
  color: white;
  background-color: #27539b;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #0d2d60;
}

.bpwin-container {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  overflow: hidden;
}

.aspect-ratio-box {
  position: relative;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
}

@supports not (aspect-ratio: 16 / 9) {
  .aspect-ratio-box {
    padding-bottom: 56.25%;
    height: 0;
  }

  .aspect-ratio-box .bpwin-iframe {
    position: absolute;
    top: 0;
    left: 0;
  }
}

.bpwin-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
</style>
