<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const iframeRef = ref(null);

function goBack() {
  router.push({ name: 'hardware' });
}

function adjustIframeContent() {
  console.log('[DEBUG] BpwinViewer: @load event fired. Running aggressive adjustment...');
  try {
    const iframe = iframeRef.value;
    if (!iframe) return;

    const iframeDoc = iframe.contentWindow.document;
    if (!iframeDoc) return;

    // --- AGGRESSIVE COMBINED APPROACH ---

    // 1. Force the layout attribute (Primary Fix)
    const frameset = iframeDoc.querySelector('frameset');
    if (frameset) {
      frameset.setAttribute('rows', '*');
      console.log('[DEBUG] Set <frameset> attribute rows="*".');
    } else {
      console.warn('[DEBUG] Could not find <frameset> element to modify.');
    }

    // 2. Force the CSS with !important (Secondary Fix)
    const styleEl = iframeDoc.createElement('style');
    styleEl.textContent = `
      /* Use !important to override any stubborn browser default styles for framesets */
      html, body, frameset {
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
    `;
    iframeDoc.head.appendChild(styleEl);
    console.log('[DEBUG] Injected !important CSS styles into iframe head.');

    console.log('%c[SUCCESS] BpwinViewer: Applied both attribute and forceful CSS fixes.', 'color: green; font-weight: bold;');

  } catch (error) {
    console.error('%c[ERROR] BpwinViewer: Failed during aggressive adjustment.', 'color: red; font-weight: bold;', error);
  }
}
</script>

<template>
  <div class="bpwin-wrapper">
    <div class="bpwin-header">
      <button class="back-button" @click="goBack">
        ← Volver a Hardware
      </button>
    </div>
    <div class="bpwin-container">
      <iframe
        ref="iframeRef"
        src="/Bpwin/Sample1.htm"
        class="bpwin-iframe"
        title="Bpwin Report"
        @load="adjustIframeContent"
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
.bpwin-wrapper {
  width: 100%;
  height: calc(100vh - 80px);
  margin-left: -20px;
  margin-right: -20px;
  margin-top: -20px;
  margin-bottom: -200px;
  width: calc(100% + 40px);
  display: flex;
  flex-direction: column;
}

.bpwin-header {
  background-color: #566782;
  padding: 10px 20px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.back-button {
  background-color: #27539B;
  color: white;
  font-size: 0.9em;
  border-radius: 10px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.back-button:hover {
  background-color: #0d2d60;
}

.bpwin-container {
  flex: 1;
  overflow: hidden;
}

.bpwin-iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>