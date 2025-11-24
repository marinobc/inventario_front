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
function killAllGoogleSheetsMargins() {
  const iframe = document.querySelector(".budget-iframe");
  if (!iframe?.contentDocument) return;
  const doc = iframe.contentDocument;
  const style = doc.createElement("style");
  style.textContent = `
    html, body { margin: 0 !important; padding: 0 !important; height: 100% !important; overflow: hidden !important; }
    .docs-sheet-outer-container, .docs-sheet-container, .grid-container, .ritz .grid-table-container, .waffle { margin: 0 !important; padding: 0 !important; height: 100% !important; }
    div[style*="margin-top"], div[style*="padding-top"] { margin-top: 0 !important; padding-top: 0 !important; }
    div[style*="margin-bottom: 30px"], div[style*="margin-bottom:30px"], .docs-sheet-container-bar, .docs-material-footer, .docs-sheet-outer-container > div:last-child { display: none !important; }
    table.waffle { height: 100% !important; }
  `;
  doc.head.appendChild(style);
}
</script>
<template>
  <div class="budget-wrapper">
    <header class="budget-header">
      <button class="back-button" @click="goBack" type="button">
        ← Volver a Hardware
      </button>
    </header>
    <div class="budget-container">
      <div class="aspect-ratio-box">
        <iframe
          src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSHF8MZcdfbyZx6HyuZZi5FlhU80lVRZdCJdynC5QURU3W_UhiUJZKfpDj-et0PAx84Drym6vpdw76x/pubhtml?widget=true&headers=false&chrome=false"
          class="budget-iframe"
          title="Presupuesto"
          frameborder="0"
          @load="killAllGoogleSheetsMargins"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.budget-wrapper {
  display: flex;
  flex-direction: column;
  margin: -20px;
  width: calc(100% + 40px);
  overflow: hidden;
  background-color: #2c3e50;
  height: calc(100vh - var(--page-height-offset));
}
.budget-header {
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
.budget-container {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}
.aspect-ratio-box {
  position: relative;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 16 / 9;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
@supports not (aspect-ratio: 16 / 9) {
  .aspect-ratio-box {
    padding-bottom: 56.25%;
    height: 0;
  }
  .aspect-ratio-box .budget-iframe {
    position: absolute;
    top: 0;
    left: 0;
  }
}
.budget-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
}
</style>
