// Requirements
import validator from 'validator';
import { vehiculoUpsert } from '../models/vehiculo.js';


// Internal
const parsePosicion = (body) => {
    if (!body || typeof body !== 'object') {
        return { error: 'Invalid payload' };
    }

    const id = typeof body.id === 'string' ? body.id.trim() : '';
    if (!id || id.length > 50) {
        return { error: 'Invalid id' };
    }

    const lat = Number(body.lat);
    const lon = Number(body.lon);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        return { error: 'Invalid lat' };
    }

    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
        return { error: 'Invalid lon' };
    }

    const speed = body.speed === undefined || body.speed === null
        ? 0
        : Number(body.speed);
    const battery = body.battery === undefined || body.battery === null
        ? 0
        : Number(body.battery);

    if (!Number.isFinite(speed) || speed < 0) {
        return { error: 'Invalid speed' };
    }

    if (!Number.isFinite(battery) || battery < 0 || battery > 100) {
        return { error: 'Invalid battery' };
    }

    if (!validator.isAlphanumeric(id, 'en-US', { ignore: '_-' })) {
        return { error: 'Invalid id format' };
    }

    return {
        data: {
            vehiculoCodigo: id,
            vehiculoLat: lat,
            vehiculoLon: lon,
            vehiculoVelocidad: speed,
            vehiculoBateria: battery,
        },
    };
};


// Exported
export const posicion = async (req, res, next) => {
    try {
        const { data, error } = parsePosicion(req.body);

        if (error) {
            console.warn('[Receptor] Parse error:', error);
            res.status(400).json({ error });
            return;
        }

        const vehiculo = await vehiculoUpsert(data);

        res.json({
            vehiculoId: vehiculo.vehiculoId,
            vehiculoCodigo: vehiculo.vehiculoCodigo,
            vehiculoLat: vehiculo.vehiculoLat,
            vehiculoLon: vehiculo.vehiculoLon,
            vehiculoVelocidad: vehiculo.vehiculoVelocidad,
            vehiculoBateria: vehiculo.vehiculoBateria,
            vehiculoUltimaActualizacion: vehiculo.vehiculoUltimaActualizacion,
        });
    } catch (err) {
        next(err);
    }
};
