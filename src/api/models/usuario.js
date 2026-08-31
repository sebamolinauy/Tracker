// Requirements
import { dbGet } from '../helpers/db.js';
import { nowDateTime } from '../helpers/date.js';


// Constants
const usuarioAtributos = [
    'usuarioId',
    'usuarioEmail',
    'usuarioNombre',
    'usuarioApellido',
    'usuarioPasswordHash',
    'usuarioRol',
    'usuarioUltimaActividad',
    'usuarioHabilitado',
];

const usuarioAtributosPublicos = [
    'usuarioId',
    'usuarioEmail',
    'usuarioNombre',
    'usuarioApellido',
    'usuarioRol',
    'usuarioUltimaActividad',
    'usuarioHabilitado',
];


// Exported
export const usuarioRoles = [
    'administrador',
    'funcionario',
];


export const usuarioGetByEmail = async (usuarioEmail) => {
    const usuario = await dbGet()
        .selectFrom('usuario')
        .select(usuarioAtributos)
        .where('usuarioEmail', '=', usuarioEmail)
        .executeTakeFirst();
    return usuario;
};


export const usuarioGet = async (usuarioId) => {
    const usuario = await dbGet()
        .selectFrom('usuario')
        .select(usuarioAtributosPublicos)
        .where('usuarioId', '=', usuarioId)
        .executeTakeFirst();
    return usuario;
};


export const usuarioAdd = async ({
    usuarioNombre, usuarioApellido, usuarioEmail, usuarioPasswordHash, usuarioRol,
}) => {
    const result = await dbGet()
        .insertInto('usuario')
        .values({
            usuarioNombre,
            usuarioApellido,
            usuarioEmail,
            usuarioPasswordHash,
            usuarioRol,
            usuarioUltimaActividad: null,
            usuarioHabilitado: 1,
        })
        .returning('usuarioId')
        .executeTakeFirstOrThrow();

    return Number(result.usuarioId);
};


export const usuarioCheckEmailExists = async (usuarioEmail) => {
    const result = await dbGet()
        .selectFrom('usuario')
        .select(['usuarioId'])
        .where('usuarioEmail', '=', usuarioEmail)
        .executeTakeFirst();
    return !!result;
};


export const usuarioUpdateUltimaActividad = async (usuarioId) => {
    const result = await dbGet()
        .updateTable('usuario')
        .set({
            usuarioUltimaActividad: nowDateTime(),
        })
        .where('usuarioId', '=', usuarioId)
        .executeTakeFirst();
    return result;
};
