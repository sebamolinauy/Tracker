// Requirements
import bcrypt from 'bcrypt';
import validator from 'validator';
import { dbInitialize, dbClose } from '../api/helpers/db.js';
import {
    usuarioAdd, usuarioCheckEmailExists, usuarioRoles,
} from '../api/models/usuario.js';
import { DB_FILENAME } from '../api/helpers/config.js';


// Constants
const BCRYPT_ROUNDS = 12;


// Internal
const parseArgs = () => {
    const args = {};
    for (let i = 2; i < process.argv.length; i += 1) {
        const arg = process.argv[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const value = process.argv[i + 1];
            if (value && !value.startsWith('--')) {
                args[key] = value;
                i += 1;
            } else {
                args[key] = true;
            }
        }
    }
    return args;
};


const printUsage = () => {
    console.log('Uso: npm run usuario-crear -- --email admin@tracker.local --nombre Admin --apellido Tracker --password secret --rol administrador');
};


// Main
const main = async () => {
    const args = parseArgs();

    if (args.help || args.h) {
        printUsage();
        return;
    }

    const email = (args.email || '').trim().toLowerCase();
    const nombre = (args.nombre || '').trim();
    const apellido = (args.apellido || '').trim();
    const password = args.password || '';
    const rol = (args.rol || 'administrador').trim();

    if (!email || !nombre || !password) {
        console.error('Error: --email, --nombre y --password son requeridos.');
        printUsage();
        process.exit(1);
    }

    if (!validator.isEmail(email)) {
        console.error('Error: email inválido.');
        process.exit(1);
    }

    if (!usuarioRoles.includes(rol)) {
        console.error(`Error: rol inválido. Valores permitidos: ${usuarioRoles.join(', ')}`);
        process.exit(1);
    }

    dbInitialize({ filename: DB_FILENAME });

    try {
        const exists = await usuarioCheckEmailExists(email);
        if (exists) {
            console.error(`Error: ya existe un usuario con email ${email}`);
            process.exit(1);
        }

        const usuarioPasswordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const usuarioId = await usuarioAdd({
            usuarioEmail: email,
            usuarioNombre: nombre,
            usuarioApellido: apellido,
            usuarioPasswordHash,
            usuarioRol: rol,
        });

        console.log(`Usuario creado: id=${usuarioId}, email=${email}, rol=${rol}`);
    } finally {
        await dbClose();
    }
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
