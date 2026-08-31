// Constants
const palette = [
    { main: '#22c55e', soft: 'rgba(34, 197, 94, 0.15)' },
    { main: '#3b82f6', soft: 'rgba(59, 130, 246, 0.15)' },
    { main: '#eab308', soft: 'rgba(234, 179, 8, 0.15)' },
    { main: '#a855f7', soft: 'rgba(168, 85, 247, 0.15)' },
    { main: '#f97316', soft: 'rgba(249, 115, 22, 0.15)' },
    { main: '#06b6d4', soft: 'rgba(6, 182, 212, 0.15)' },
];


// Exported
export default (codigo) => {
    let hash = 0;
    for (let i = 0; i < codigo.length; i += 1) {
        hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
    }
    return palette[Math.abs(hash) % palette.length];
};
