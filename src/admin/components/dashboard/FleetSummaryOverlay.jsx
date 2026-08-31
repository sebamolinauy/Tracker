// Requirements
import { Truck } from 'lucide-react';


// Exported
export default ({ vehiculos }) => {
    const active = vehiculos.filter(v => v.online).length;

    return (
        <div className="dashboard-fleet-overlay">
            <Truck size={18} strokeWidth={2} />
            <div>
                <div className="dashboard-fleet-overlay-value">{active} activos</div>
                <div className="dashboard-fleet-overlay-label">
                    {vehiculos.length} vehículo{vehiculos.length === 1 ? '' : 's'} en flota
                </div>
            </div>
        </div>
    );
};
