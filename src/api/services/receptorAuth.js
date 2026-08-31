// Requirements
import { timingSafeEqual } from 'crypto';
import { RECEPTOR_API_KEY } from '../helpers/config.js';


// Internal
const tokensMatch = (received, expected) => {
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);

    if (receivedBuffer.length !== expectedBuffer.length) {
        return false;
    }

    return timingSafeEqual(receivedBuffer, expectedBuffer);
};


// Exported
export const receptorAuth = (req, res, next) => {
    if (!RECEPTOR_API_KEY) {
        res.status(503).json({ error: 'Receptor API key not configured' });
        return;
    }

    const authorization = req.headers.authorization || '';
    const match = authorization.match(/^Bearer\s+(.+)$/i);

    if (!match || !tokensMatch(match[1], RECEPTOR_API_KEY)) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    next();
};
