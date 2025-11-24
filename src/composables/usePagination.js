import { ref, computed, watch } from 'vue';

export function usePagination(items, itemsPerPage = 10) {
    const currentPage = ref(1);
    const pageSize = ref(itemsPerPage);

    // Reset to page 1 when items change length significantly (optional but good practice)
    // But here items is a computed ref, so we might want to watch it.
    // However, if we filter, we probably want to go back to page 1.
    watch(() => items.value.length, () => {
        if (currentPage.value > totalPages.value) {
            currentPage.value = 1;
        }
    });

    const totalPages = computed(() => {
        if (items.value.length === 0) return 1;
        return Math.ceil(items.value.length / pageSize.value);
    });

    const paginatedItems = computed(() => {
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        return items.value.slice(start, end);
    });

    const nextPage = () => {
        if (currentPage.value < totalPages.value) {
            currentPage.value++;
        }
    };

    const prevPage = () => {
        if (currentPage.value > 1) {
            currentPage.value--;
        }
    };

    const setPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    };

    return {
        currentPage,
        pageSize,
        totalPages,
        paginatedItems,
        nextPage,
        prevPage,
        setPage
    };
}
