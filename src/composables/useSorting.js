import { ref, computed } from 'vue';

export function useSorting(items, initialSortKey = '', initialSortOrder = 'asc') {
    const sortKey = ref(initialSortKey);
    const sortOrder = ref(initialSortOrder); // 'asc' or 'desc'

    const sortedItems = computed(() => {
        if (!sortKey.value) return items.value;

        return [...items.value].sort((a, b) => {
            let valA = a[sortKey.value];
            let valB = b[sortKey.value];

            // Handle null/undefined
            if (valA === null || valA === undefined) valA = '';
            if (valB === null || valB === undefined) valB = '';

            // Case insensitive for strings
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
            return 0;
        });
    });

    const sortBy = (key) => {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortKey.value = key;
            sortOrder.value = 'asc';
        }
    };

    return {
        sortKey,
        sortOrder,
        sortedItems,
        sortBy
    };
}
