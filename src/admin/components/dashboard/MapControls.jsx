// Requirements
import { Layers, LocateFixed, Minus, Plus } from 'lucide-react';
import { useMap } from 'react-leaflet';


// Exported
export default ({ mapLayer, onToggleLayer, onLocate }) => {
    const map = useMap();

    return (
        <div className="dashboard-map-controls">
            <button type="button" aria-label="Acercar" onClick={() => map.zoomIn()}>
                <Plus size={18} />
            </button>
            <button type="button" aria-label="Alejar" onClick={() => map.zoomOut()}>
                <Minus size={18} />
            </button>
            <button type="button" aria-label="Centrar flota" onClick={onLocate}>
                <LocateFixed size={18} />
            </button>
            <button type="button" aria-label="Cambiar capa" onClick={onToggleLayer}>
                <Layers size={18} />
            </button>
            <span className="dashboard-map-controls-hint">
                {mapLayer === 'satellite' ? 'Satélite' : 'Calles'}
            </span>
        </div>
    );
};
