export const HTTP_PORT = Number(process.env.HTTP_PORT) || 3000;
export const HTTP_BIND = process.env.HTTP_BIND || '127.0.0.1';

export const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || '';

export const RECEPTOR_API_KEY = process.env.RECEPTOR_API_KEY || '';

export const COOKIE_NAME = process.env.COOKIE_NAME || '';
export const COOKIE_SIGN_SECRET = process.env.COOKIE_SIGN_SECRET || '';

export const DB_FILENAME = process.env.DB_FILENAME || './data/tracker.db';

export const VEHICULO_ONLINE_TIMEOUT_MS = Number(process.env.VEHICULO_ONLINE_TIMEOUT_MS) || 10000;
