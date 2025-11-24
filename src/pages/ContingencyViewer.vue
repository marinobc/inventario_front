<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
let originalOverflow = "";
onMounted(() => {
  window.scrollTo(0, 0);
  originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
});
onBeforeUnmount(() => {
  document.body.style.overflow = originalOverflow;
});
function goBack() {
  router.push({ name: "hardware" });
}
</script>
<template>
  <div class="contingency-wrapper">
    <header class="contingency-header">
      <button class="back-button" @click="goBack" type="button">
        ← Volver a Hardware
      </button>
    </header>
    <div class="contingency-container">
      <div class="aspect-ratio-box">
        <iframe
          src="https://docs.google.com/document/d/1uBanUBnXgn7A8r41-Pxc0kGNhBIvef0l/edit?usp=sharing&ouid=109915780706663153797&rtpof=true&sd=true"
          class="contingency-iframe"
          title="Google Sheets Report"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.contingency-wrapper {
  display: flex;
  flex-direction: column;
  margin: -20px;
  width: calc(100% + 40px);
  height: calc(100vh - var(--page-height-offset));
  overflow: hidden;
  background-color: #2c3e50;
}
.contingency-header {
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
.contingency-container {
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
  .aspect-ratio-box .contingency-iframe {
    position: absolute;
    top: 0;
    left: 0;
  }
}
.contingency-iframe {
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
