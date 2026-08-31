// Requirements
import { useCallback, useEffect, useState } from 'react';
import api from '../api';
import { VEHICULO_POLL_MS } from '../helpers/config.js';


// Exported
export default () => {
    const [vehiculos, setVehiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastFetch, setLastFetch] = useState(null);

    const fetchVehiculos = useCallback(() => {
        api.vehiculoList((data) => {
            setVehiculos(data);
            setLoading(false);
            setError(null);
            setLastFetch(Date.now());
        }, (err) => {
            setError(err);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchVehiculos();

        const intervalId = setInterval(fetchVehiculos, VEHICULO_POLL_MS);

        return () => clearInterval(intervalId);
    }, [fetchVehiculos]);

    const removeVehiculo = useCallback((vehiculoCodigo, onSuccess, onError) => {
        api.vehiculoDelete(vehiculoCodigo, () => {
            setVehiculos(prev => prev.filter(v => v.vehiculoCodigo !== vehiculoCodigo));
            onSuccess?.();
        }, onError);
    }, []);

    return { vehiculos, loading, error, lastFetch, removeVehiculo };
};
