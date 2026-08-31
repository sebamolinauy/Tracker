// Requirements
import { useEffect, useState } from 'react';
import '../../style/dashboard.css';
import useVehiculoPoll from '../../hooks/useVehiculoPoll.js';
import DashboardHeader from './DashboardHeader.jsx';
import VehicleMap from './VehicleMap.jsx';
import VehicleSidebar from './VehicleSidebar.jsx';


// Exported
export default () => {
    const { vehiculos, loading, error, lastFetch, removeVehiculo } = useVehiculoPoll();
    const [selectedCodigo, setSelectedCodigo] = useState(null);
    const [tick, setTick] = useState(Date.now());

    const handleDelete = (vehiculoCodigo) => {
        removeVehiculo(vehiculoCodigo, () => {
            if (selectedCodigo === vehiculoCodigo) setSelectedCodigo(null);
        });
    };

    useEffect(() => {
        const intervalId = setInterval(() => setTick(Date.now()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    const connected = !error && (lastFetch !== null || loading);

    return (
        <div className="dashboard-shell">
            <DashboardHeader connected={connected} />
            <div className="dashboard-body">
                <VehicleSidebar
                    vehiculos={vehiculos}
                    selectedCodigo={selectedCodigo}
                    onSelect={setSelectedCodigo}
                    onDelete={handleDelete}
                    loading={loading}
                    error={error}
                    tick={tick}
                />
                <VehicleMap
                    vehiculos={vehiculos}
                    selectedCodigo={selectedCodigo}
                    onSelect={setSelectedCodigo}
                    loading={loading}
                />
            </div>
        </div>
    );
};
