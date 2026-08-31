// Requirements
import { vehiculoDeleteByCodigo, vehiculoList, vehiculoToPayload } from '../models/vehiculo.js';


// Exported
export const list = async (req, res, next) => {
    try {
        const rows = await vehiculoList();
        res.json(rows.map(vehiculoToPayload));
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        const deleted = await vehiculoDeleteByCodigo(req.params.codigo);
        if (!deleted) {
            res.status(404).json({ error: 'Vehículo no encontrado' });
            return;
        }
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
};
