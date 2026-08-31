// Requirements
import moment from 'moment';
import { dbGet } from '../helpers/db.js';
import { nowDateTime } from '../helpers/date.js';
import { VEHICULO_ONLINE_TIMEOUT_MS } from '../helpers/config.js';


// Constants
const vehiculoAtributos = [
    'vehiculoId',
    'vehiculoCodigo',
    'vehiculoLat',
    'vehiculoLon',
    'vehiculoVelocidad',
    'vehiculoBateria',
    'vehiculoUltimaActualizacion',
    'vehiculoCreado',
];

// Internal
const isOnline = (vehiculoUltimaActualizacion) => {
    const lastUpdate = moment.utc(vehiculoUltimaActualizacion, 'YYYY-MM-DD HH:mm:ss');
    return moment.utc().diff(lastUpdate) < VEHICULO_ONLINE_TIMEOUT_MS;
};


// Exported
export const vehiculoToPayload = row => ({
    vehiculoId: row.vehiculoId,
    vehiculoCodigo: row.vehiculoCodigo,
    vehiculoLat: row.vehiculoLat,
    vehiculoLon: row.vehiculoLon,
    vehiculoVelocidad: row.vehiculoVelocidad,
    vehiculoBateria: row.vehiculoBateria,
    vehiculoUltimaActualizacion: row.vehiculoUltimaActualizacion,
    online: isOnline(row.vehiculoUltimaActualizacion),
});

export const vehiculoList = async () => dbGet()
    .selectFrom('vehiculo')
    .select(vehiculoAtributos)
    .orderBy('vehiculoCodigo', 'asc')
    .execute();

export const vehiculoUpsert = async ({
    vehiculoCodigo, vehiculoLat, vehiculoLon, vehiculoVelocidad, vehiculoBateria,
}) => {
    const now = nowDateTime();

    await dbGet()
        .insertInto('vehiculo')
        .values({
            vehiculoCodigo,
            vehiculoLat,
            vehiculoLon,
            vehiculoVelocidad,
            vehiculoBateria,
            vehiculoUltimaActualizacion: now,
            vehiculoCreado: now,
        })
        .onConflict(oc => oc
            .column('vehiculoCodigo')
            .doUpdateSet({
                vehiculoLat,
                vehiculoLon,
                vehiculoVelocidad,
                vehiculoBateria,
                vehiculoUltimaActualizacion: now,
            }))
        .execute();

    return dbGet()
        .selectFrom('vehiculo')
        .select(vehiculoAtributos)
        .where('vehiculoCodigo', '=', vehiculoCodigo)
        .executeTakeFirstOrThrow();
};

export const vehiculoDeleteByCodigo = async (vehiculoCodigo) => {
    const result = await dbGet()
        .deleteFrom('vehiculo')
        .where('vehiculoCodigo', '=', vehiculoCodigo)
        .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
};
