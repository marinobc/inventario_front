<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const iframeRef = ref(null);
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
function adjustIframeContent() {
  const iframe = iframeRef.value;
  if (!iframe) return;
  try {
    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;
    const frameset = iframeDoc.querySelector("frameset");
    if (frameset) {
      frameset.setAttribute("rows", "*");
    }
    const style = iframeDoc.createElement("style");
    style.textContent = `
      html, body, frameset {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    `;
    iframeDoc.head.appendChild(style);
  } catch (error) {
    if (error.name !== "SecurityError") {
      console.error("Iframe adjustment failed:", error);
    }
  }
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
      <iframe
        ref="iframeRef"
        src="/Bpwin/Sample1.htm"
        class="bpwin-iframe"
        title="Bpwin Report"
        @load="adjustIframeContent"
      />
    </div>
  </div>
</template>
<style scoped>
.bpwin-wrapper {
  display: flex;
  flex-direction: column;
  margin: -20px;
  width: calc(100% + 40px);
  overflow: hidden;
  height: calc(100vh - var(--page-height-offset));
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
}
.bpwin-iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
