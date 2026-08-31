// Requirements
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import timeout from 'connect-timeout';
import { session as sessionService } from '../services/authentication.js';
import { COOKIE_SIGN_SECRET, ADMIN_BASE_URL } from '../helpers/config.js';
import { environment } from '../helpers/environment.js';
import authentication from '../routes/authentication.js';
import receptor from '../routes/receptor.js';
import usuario from '../routes/usuario.js';
import vehiculo from '../routes/vehiculo.js';
import { loadAppOrAuthenticate } from '../controllers/authentication.js';
import { publicLimiter } from '../helpers/rateLimiter.js';


// Exported
export const httpServerCreate = async () => {
    const baseFolder = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../');

    const app = express();

    app.set('trust proxy', 1);

    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }));

    if (environment === 'development') {
        app.use(cors({
            credentials: true,
            origin: [
                ADMIN_BASE_URL.replace(/\/$/, ''),
            ],
        }));
    }

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({
        extended: false,
        parameterLimit: 1000,
        depth: 32,
    }));
    app.use(compression());
    app.use(timeout('200s'));
    app.use(cookieParser(COOKIE_SIGN_SECRET));

    app.use('/authentication', authentication);

    app.get('/', loadAppOrAuthenticate(baseFolder));

    if (environment === 'production') {
        app.use('/admin.index.js', sessionService, express.static(`${baseFolder}distribution/admin/admin.index.js`));
        app.use('/admin.index.css', sessionService, express.static(`${baseFolder}distribution/admin/admin.index.css`));
    }

    app.use('/api/', publicLimiter);
    app.use('/api/receptor', receptor);
    app.use('/api/usuario', usuario);
    app.use('/api/vehiculo', vehiculo);

    if (environment === 'production') {
        app.use((req, res) => {
            const requestBaseUrl = `https://${req.get('host')}/`;
            if (requestBaseUrl === ADMIN_BASE_URL) {
                res.sendFile('distribution/admin/index.html', { root: baseFolder });
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        });
    } else {
        app.use((req, res) => {
            res.status(404).json({ error: 'Not found' });
        });
    }

    return app;
};
