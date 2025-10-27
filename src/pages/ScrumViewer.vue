<script setup>
import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Your Smartsheet URL
const smartsheetUrl =
    "https://app.smartsheet.com/workspaces/rQ6RJQm2pw7FV9qq7XQXWW97c3rrVgHCpgmM64g1";

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

function openSmartsheet() {
    window.open(smartsheetUrl, "_blank");
}

function openDocumentation() {
    window.open('https://help.smartsheet.com/articles/522078-publishing-smartsheet-items', '_blank')
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
            <div class="content-box">
                <div class="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                </div>
                <h2>Smartsheet Workspace</h2>
                <p>Haz clic en el botón azul para abrir Smartsheet en una nueva pestaña.</p>
                <p class="note">
                    La organización requiere un plan Business o Enterprise para visualizar
                    el contenido directamente aquí mediante publicación embebida.
                </p>
                <button class="open-button" @click="openSmartsheet">
                    Abrir Smartsheet
                </button>
                <button class="open-button secondary" @click="openDocumentation">
                    Documentación Técnica
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.bpwin-wrapper {
    display: flex;
    flex-direction: column;
    margin: -20px;
    width: calc(100% + 40px);
    height: calc(100vh - 80px);
    background-color: #566782;
    overflow: hidden;
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
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow: auto;
    min-height: 0;
}

.content-box {
    background-color: white;
    padding: 40px 30px;
    border-radius: 16px;
    text-align: center;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.icon {
    color: #27539b;
    margin-bottom: 20px;
}

.icon svg {
    width: 60px;
    height: 60px;
}

.content-box h2 {
    color: #27539b;
    font-size: 1.5em;
    margin-bottom: 16px;
}

.content-box p {
    color: #555;
    font-size: 1em;
    line-height: 1.6;
    margin-bottom: 12px;
}

.note {
    font-size: 0.85em !important;
    color: #888;
    font-style: italic;
    margin-top: 20px;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #27539b;
}

.open-button {
    margin-top: 24px;
    padding: 12px 28px;
    font-size: 1em;
    font-weight: 600;
    color: white;
    background-color: #27539b;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(39, 83, 155, 0.3);
}

/* Responsive adjustments */
@media (max-height: 600px) {
    .content-box {
        padding: 30px 20px;
    }

    .icon svg {
        width: 50px;
        height: 50px;
    }

    .content-box h2 {
        font-size: 1.3em;
    }

    .content-box p {
        font-size: 0.9em;
    }
}

@media (max-width: 600px) {
    .content-box {
        padding: 30px 20px;
        max-width: 90%;
    }
}

.open-button:hover {
    background-color: #0d2d60;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(39, 83, 155, 0.4);
}

.open-button:active {
    transform: translateY(0);
}

.open-button+.open-button {
    margin-left: 16px;
}

.open-button.secondary {
    background-color: #6c757d;
    /* soft grey tone */
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.open-button.secondary:hover {
    background-color: #5a6268;
    box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
}
</style>
