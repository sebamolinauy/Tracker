// Requirements
import createRateLimit from 'express-rate-limit';


// Internal
const rateLimitHandler = type => (req, res) => {
    console.warn(`[Rate Limit] ${type} | IP: ${req.ip} | ${req.method} ${req.originalUrl}`);

    res.status(429).json({ error: 'Demasiadas solicitudes, por favor intente nuevamente en unos momentos.' });
};


// Exported
export const publicLimiter = createRateLimit({
    windowMs: 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: rateLimitHandler('public'),
});
