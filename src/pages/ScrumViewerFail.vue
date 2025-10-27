<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const iframeRef = ref(null);

// Your URL here
const iframeUrl = 'https://app.smartsheet.com/workspaces/rQ6RJQm2pw7FV9qq7XQXWW97c3rrVgHCpgmM64g1';

let originalOverflow = '';
let originalMargin = '';

onMounted(() => {
    window.scrollTo(0, 0);
    originalOverflow = document.body.style.overflow;
    originalMargin = document.body.style.margin;
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
});

onBeforeUnmount(() => {
    document.body.style.overflow = originalOverflow;
    document.body.style.margin = originalMargin;
});

function goBack() {
    router.push({ name: 'hardware' });
}

function adjustIframeContent() {
    const iframe = iframeRef.value;
    if (!iframe) return;

    try {
        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) return;

        const frameset = iframeDoc.querySelector('frameset');
        if (frameset) {
            frameset.setAttribute('rows', '*');
        }

        const style = iframeDoc.createElement('style');
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
        if (error.name !== 'SecurityError') {
            console.error('Iframe adjustment failed:', error);
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
            <div class="aspect-ratio-box">
                <iframe ref="iframeRef" :src="iframeUrl" class="bpwin-iframe" title="Smartsheet Report"
                    @load="adjustIframeContent" />
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
    background-color: #27539B;
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
    background-color: #566782;
}

.aspect-ratio-box {
    position: relative;
    width: 100%;
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 16 / 9;
    background-color: #000;
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
}
</style>