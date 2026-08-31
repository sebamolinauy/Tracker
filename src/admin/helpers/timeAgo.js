// Internal
const parseUtcDateTime = dateStr => new Date(`${dateStr.replace(' ', 'T')}Z`);


// Exported
export const timeAgo = (dateStr, now = Date.now()) => {
    if (!dateStr) return '—';

    const then = parseUtcDateTime(dateStr).getTime();
    if (Number.isNaN(then)) return '—';

    const diff = Math.max(0, now - then);

    if (diff < 5000) return 'hace un instante';
    if (diff < 60000) return `hace ${Math.floor(diff / 1000)} s`;
    if (diff < 3600000) return `hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)} h`;

    return `hace ${Math.floor(diff / 86400000)} d`;
};
