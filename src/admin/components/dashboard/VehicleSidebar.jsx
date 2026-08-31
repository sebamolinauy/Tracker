// Requirements
import { useMemo, useState } from 'react';
import { Box, Flex, ScrollArea, Text } from '@radix-ui/themes';
import { Trash2, Truck } from 'lucide-react';
import vehicleColor from '../../helpers/vehicleColor.js';
import { timeAgo } from '../../helpers/timeAgo.js';


// Internal
const motionLabel = (v) => {
    if (!v.online) return 'Sin señal';
    if (v.vehiculoVelocidad > 1) return 'En movimiento';
    return 'Detenido';
};

const motionDotClass = (v) => {
    if (!v.online) return 'dashboard-status-dot--offline';
    if (v.vehiculoVelocidad > 1) return 'dashboard-status-dot--live';
    return 'dashboard-status-dot--idle';
};


// Exported
export default ({
    vehiculos, selectedCodigo, onSelect, onDelete, loading, error, tick,
}) => {
    const [search, setSearch] = useState('');

    const sorted = useMemo(() => {
        const q = search.trim().toLowerCase();
        return [...vehiculos]
            .filter(v => !q || v.vehiculoCodigo.toLowerCase().includes(q))
            .sort((a, b) => {
                if (a.online !== b.online) return a.online ? -1 : 1;
                return a.vehiculoCodigo.localeCompare(b.vehiculoCodigo);
            });
    }, [vehiculos, search]);

    return (
        <aside className="dashboard-sidebar">
            <div className="dashboard-section-label">VEHÍCULOS</div>
            <div className="dashboard-search">
                <input
                    type="search"
                    placeholder="Buscar vehículo…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <ScrollArea scrollbars="vertical" style={{ flex: 1 }}>
                <Flex direction="column" gap="1" pb="2">
                    {loading && vehiculos.length === 0 && (
                        <Text className="dashboard-empty-state">Cargando flota…</Text>
                    )}

                    {error && (
                        <Text className="dashboard-empty-state dashboard-empty-state--error">
                            {error}
                        </Text>
                    )}

                    {!loading && !error && sorted.length === 0 && (
                        <div className="dashboard-empty-state">
                            {search
                                ? 'Ningún vehículo coincide con la búsqueda.'
                                : 'Esperando señal GPS…'}
                        </div>
                    )}

                    {sorted.map((v) => {
                        const selected = selectedCodigo === v.vehiculoCodigo;
                        const color = vehicleColor(v.vehiculoCodigo);

                        return (
                            <Box
                                key={v.vehiculoCodigo}
                                className={`dashboard-vehicle-row${selected ? ' dashboard-vehicle-row--selected' : ''}`}
                                onClick={() => onSelect(v.vehiculoCodigo)}
                            >
                                <Flex gap="3" align="start" style={{ position: 'relative' }}>
                                    <Flex
                                        align="center"
                                        justify="center"
                                        flexShrink="0"
                                        className="dashboard-vehicle-icon"
                                        style={{
                                            borderColor: v.online ? color.main : '#64748b',
                                            background: v.online ? color.soft : 'rgba(100, 116, 139, 0.12)',
                                            color: v.online ? color.main : '#94a3b8',
                                        }}
                                    >
                                        <Truck size={18} strokeWidth={2.25} />
                                    </Flex>
                                    <Flex direction="column" gap="1" style={{ flex: 1, minWidth: 0 }}>
                                        <Text className="dashboard-vehicle-name" truncate>
                                            {v.vehiculoCodigo}
                                        </Text>
                                        <div className="dashboard-vehicle-status">
                                            <span className={`dashboard-status-dot ${motionDotClass(v)}`} />
                                            <span>{motionLabel(v)}</span>
                                            {v.online && (
                                                <span>· {Math.round(v.vehiculoVelocidad)} km/h</span>
                                            )}
                                        </div>
                                        <Text size="1" className="dashboard-muted">
                                            Batería {v.vehiculoBateria}% · {timeAgo(v.vehiculoUltimaActualizacion, tick)}
                                        </Text>
                                    </Flex>
                                    <button
                                        type="button"
                                        className="dashboard-vehicle-delete"
                                        title="Eliminar vehículo"
                                        aria-label={`Eliminar ${v.vehiculoCodigo}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(v.vehiculoCodigo);
                                        }}
                                    >
                                        <Trash2 size={14} strokeWidth={2} />
                                    </button>
                                </Flex>
                            </Box>
                        );
                    })}
                </Flex>
            </ScrollArea>
        </aside>
    );
};
