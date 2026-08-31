// Requirements
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../theme.jsx';
import AnimatedMarker from './AnimatedMarker.jsx';
import FleetSummaryOverlay from './FleetSummaryOverlay.jsx';
import MapControls from './MapControls.jsx';


// Constants
const defaultCenter = [-34.9201, -56.1700];
const defaultZoom = 13;

const tileLayers = {
    satellite: {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri',
    },
    street: {
        light: {
            url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            attribution: '&copy; OpenStreetMap &copy; CARTO',
        },
        dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attribution: '&copy; OpenStreetMap &copy; CARTO',
        },
    },
};


// Internal
const FitBounds = ({ vehiculos, refitTick }) => {
    const map = useMap();
    const fittedRef = useRef(false);

    useEffect(() => {
        if (!vehiculos.length) return;

        const bounds = vehiculos.map(v => [v.vehiculoLat, v.vehiculoLon]);
        if (!fittedRef.current) {
            fittedRef.current = true;
            if (bounds.length === 1) {
                map.setView(bounds[0], map.getZoom() < 12 ? 14 : map.getZoom());
                return;
            }
            map.fitBounds(bounds, { padding: [64, 64], maxZoom: 16 });
            return;
        }

        if (refitTick > 0) {
            if (bounds.length === 1) {
                map.flyTo(bounds[0], Math.max(map.getZoom(), 14), { duration: 0.6 });
                return;
            }
            map.flyToBounds(bounds, { padding: [64, 64], maxZoom: 16, duration: 0.6 });
        }
    }, [map, vehiculos, refitTick]);

    return null;
};

const FlyToSelected = ({ vehiculos, selectedCodigo }) => {
    const map = useMap();

    useEffect(() => {
        if (!selectedCodigo) return;

        const vehiculo = vehiculos.find(v => v.vehiculoCodigo === selectedCodigo);
        if (!vehiculo) return;

        map.flyTo([vehiculo.vehiculoLat, vehiculo.vehiculoLon], Math.max(map.getZoom(), 15), {
            duration: 0.6,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fly only when selection changes
    }, [map, selectedCodigo]);

    return null;
};


// Exported
export default ({
    vehiculos, selectedCodigo, onSelect, loading,
}) => {
    const { theme } = useTheme();
    const [mapLayer, setMapLayer] = useState('satellite');
    const [refitTick, setRefitTick] = useState(0);
    const tiles = mapLayer === 'satellite'
        ? tileLayers.satellite
        : tileLayers.street[theme] || tileLayers.street.dark;

    return (
        <div className="dashboard-map-wrap">
            <FleetSummaryOverlay vehiculos={vehiculos} />
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    key={`${mapLayer}-${theme}`}
                    attribution={tiles.attribution}
                    url={tiles.url}
                    maxZoom={19}
                />
                <MapControls
                    mapLayer={mapLayer}
                    onToggleLayer={() => setMapLayer(l => (l === 'satellite' ? 'street' : 'satellite'))}
                    onLocate={() => setRefitTick(n => n + 1)}
                />
                <FitBounds vehiculos={vehiculos} refitTick={refitTick} />
                <FlyToSelected vehiculos={vehiculos} selectedCodigo={selectedCodigo} />
                {vehiculos.map(v => (
                    <AnimatedMarker
                        key={v.vehiculoCodigo}
                        vehiculo={v}
                        selected={selectedCodigo === v.vehiculoCodigo}
                        onSelect={onSelect}
                    />
                ))}
            </MapContainer>
            {!loading && vehiculos.length === 0 && (
                <div className="dashboard-map-empty">
                    <span>Esperando señal GPS…</span>
                </div>
            )}
        </div>
    );
};
