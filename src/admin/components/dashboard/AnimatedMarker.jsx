// Requirements
import { useEffect, useRef } from 'react';
import { Marker } from 'react-leaflet';
import createVehicleIcon from './vehicleIcon.js';


// Constants
const durationMs = 800;


// Internal
const iconKey = (vehiculo, selected) => [
    vehiculo.vehiculoCodigo,
    vehiculo.online,
    selected,
    Math.round(vehiculo.vehiculoVelocidad),
].join('|');


// Exported
export default ({
    vehiculo, selected, onSelect,
}) => {
    const markerRef = useRef(null);
    const prevPositionRef = useRef(null);
    const frameRef = useRef(null);
    const iconKeyRef = useRef(iconKey(vehiculo, selected));

    useEffect(() => {
        const marker = markerRef.current;
        if (!marker) return undefined;

        const to = [vehiculo.vehiculoLat, vehiculo.vehiculoLon];
        const from = prevPositionRef.current;

        prevPositionRef.current = to;

        if (!from || (from[0] === to[0] && from[1] === to[1])) {
            return undefined;
        }

        if (frameRef.current) cancelAnimationFrame(frameRef.current);

        let start = null;

        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const t = Math.min((timestamp - start) / durationMs, 1);
            const eased = t * (2 - t);
            const lat = from[0] + (to[0] - from[0]) * eased;
            const lng = from[1] + (to[1] - from[1]) * eased;
            marker.setLatLng([lat, lng]);

            if (t < 1) {
                frameRef.current = requestAnimationFrame(animate);
            } else {
                frameRef.current = null;
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [vehiculo.vehiculoLat, vehiculo.vehiculoLon]);

    useEffect(() => {
        const marker = markerRef.current;
        if (!marker) return;

        const nextKey = iconKey(vehiculo, selected);
        if (nextKey === iconKeyRef.current) return;

        iconKeyRef.current = nextKey;
        marker.setIcon(createVehicleIcon(vehiculo.vehiculoCodigo, vehiculo.online, selected, vehiculo.vehiculoVelocidad));
    }, [vehiculo, selected]);

    const initialIcon = createVehicleIcon(vehiculo.vehiculoCodigo, vehiculo.online, selected, vehiculo.vehiculoVelocidad);

    return (
        <Marker
            ref={markerRef}
            position={[vehiculo.vehiculoLat, vehiculo.vehiculoLon]}
            icon={initialIcon}
            eventHandlers={{
                click: () => onSelect(vehiculo.vehiculoCodigo),
            }}
        />
    );
};
