// Requirements
import bcrypt from 'bcrypt';
import validator from 'validator';
import { usuarioGetByEmail } from '../models/usuario.js';
import { xMonthsFromNow, xMonthsFromNowDateTime } from '../helpers/date.js';
import {
    createSession, getUsuarioFromToken, sessionDurationMonths,
} from '../services/authentication.js';
import {
    COOKIE_NAME, ADMIN_BASE_URL, HTTP_PORT,
} from '../helpers/config.js';
import { environment } from '../helpers/environment.js';


// Internal
const getCookieOptions = () => {
    const cookieOptions = {
        expires: xMonthsFromNow(sessionDurationMonths),
        signed: true,
        httpOnly: true,
        sameSite: 'lax',
    };
    if (['production', 'staging'].includes(environment)) {
        cookieOptions.secure = true;
    }
    return cookieOptions;
};


// Exported
export const login = async (req, res, next) => {
    try {
        const email = (req.body.email || '').trim().toLowerCase();
        const password = req.body.password || '';

        if (!validator.isEmail(email)) {
            res.status(400).json({ error: 'Email inválido' });
            return;
        }

        if (!password) {
            res.status(400).json({ error: 'Contraseña requerida' });
            return;
        }

        const usuario = await usuarioGetByEmail(email);
        if (!usuario || !usuario.usuarioHabilitado) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        const passwordValid = await bcrypt.compare(password, usuario.usuarioPasswordHash);
        if (!passwordValid) {
            res.status(401).json({ error: 'Credenciales inválidas' });
            return;
        }

        const token = createSession(usuario.usuarioId);
        res.cookie(COOKIE_NAME, token, getCookieOptions());
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
};


export const loadAppOrAuthenticate = baseFolder => async (req, res) => {
    const { usuario } = await getUsuarioFromToken(req.signedCookies?.[COOKIE_NAME]);
    if (environment === 'development') {
        if (usuario) {
            res.redirect(ADMIN_BASE_URL);
        } else {
            res.redirect(`${ADMIN_BASE_URL}login`);
        }
    } else {
        const requestBaseUrl = `https://${req.get('host')}/`;
        if (!usuario && requestBaseUrl === ADMIN_BASE_URL) {
            res.redirect(`${ADMIN_BASE_URL}login`);
        } else if (requestBaseUrl === ADMIN_BASE_URL) {
            res.sendFile('distribution/admin/index.html', { root: baseFolder });
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    }
};


export const logout = async (req, res, next) => {
    try {
        res.clearCookie(COOKIE_NAME);
        if (environment === 'development') {
            res.redirect(`${ADMIN_BASE_URL}login`);
        } else {
            res.redirect(`${ADMIN_BASE_URL}login`);
        }
    } catch (error) {
        next(error);
    }
};


export const sessionInfo = async (req, res) => {
    res.json({
        expires: xMonthsFromNowDateTime(sessionDurationMonths),
        port: HTTP_PORT,
    });
};
