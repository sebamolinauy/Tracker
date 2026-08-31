// Requirements
import jwt from 'jsonwebtoken';
import { nowDateTime, xMonthsFromNowDateTime } from '../helpers/date.js';
import { usuarioGet, usuarioUpdateUltimaActividad } from '../models/usuario.js';
import { COOKIE_NAME, COOKIE_SIGN_SECRET } from '../helpers/config.js';


// Internal
const encrypt = (toEncrypt) => {
    if (!COOKIE_SIGN_SECRET) {
        throw new Error('Configure JWT');
    }
    return jwt.sign(toEncrypt, COOKIE_SIGN_SECRET, { algorithm: 'HS256' });
};

const decrypt = (toDecrypt) => {
    if (!COOKIE_SIGN_SECRET) {
        throw new Error('Configure JWT');
    }
    return jwt.verify(toDecrypt, COOKIE_SIGN_SECRET, { algorithms: ['HS256'] });
};


// Exported
export const sessionDurationMonths = 8;


export const createSession = usuarioId => encrypt({
    usuarioId,
    emitted: nowDateTime(),
    expires: xMonthsFromNowDateTime(sessionDurationMonths),
});


export const getUsuarioFromToken = async (token) => {
    if (!token) {
        return { error: 'Invalid token' };
    }

    let decodified = null;
    try {
        decodified = decrypt(token);
    } catch {
        return { error: 'Invalid token' };
    }

    if (
        !decodified
        || !decodified.emitted
        || !decodified.expires
        || decodified.expires < nowDateTime()
    ) {
        return { error: 'Expired token' };
    }

    try {
        const usuario = await usuarioGet(decodified.usuarioId);
        if (!usuario || !usuario.usuarioHabilitado) {
            return { error: 'Usuario deshabilitado' };
        }
        return { usuario };
    } catch (error) {
        return { error: `Internal error: ${error.message}` };
    }
};


export const session = async (req, res, next) => {
    try {
        const { usuario, error } = await getUsuarioFromToken(req.signedCookies ? req.signedCookies[COOKIE_NAME] : '');
        if (error) {
            res.statusMessage = error;
            res.status(401).json({ error });
            return;
        }
        req.usuario = usuario;

        setTimeout(() => { usuarioUpdateUltimaActividad(usuario.usuarioId); });

        next();
    } catch (error) {
        next(error);
    }
};
