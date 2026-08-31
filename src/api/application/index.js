// Requirements
import http from 'http';
import { environment } from '../helpers/environment.js';
import { dbClose, dbInitialize } from '../helpers/db.js';
import { DB_FILENAME, HTTP_BIND, HTTP_PORT } from '../helpers/config.js';
import { httpServerCreate } from './http.js';


// Constants
const httpServerTimeout = 180 * 1000;


// Internal
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});


// Main
const main = async () => {
    try {
        dbInitialize({ filename: DB_FILENAME });

        const s = await httpServerCreate();
        const httpServer = http.createServer(s);
        httpServer.timeout = httpServerTimeout;
        const httpPort = HTTP_PORT;

        httpServer.on('error', (error) => {
            if (error.syscall === 'listen' && error.code === 'EACCES') {
                throw new Error(`${httpPort} requires privileges`);
            } else if (error.syscall === 'listen' && error.code === 'EADDRINUSE') {
                throw new Error(`${httpPort} in use`);
            } else {
                throw new Error(`${error.syscall}: ${error.code}`);
            }
        });

        httpServer.on('listening', () => {
            const addr = httpServer.address();
            if (addr.address && addr.port) {
                console.log('Main:', `Starting in ${environment} at ${addr.address}:${addr.port}`);
            } else {
                console.log('Main', `Strange, listening in ${addr}`);
            }
        });

        httpServer.listen(httpPort, HTTP_BIND);

        process.once('SIGINT', async () => {
            try {
                await dbClose();
                httpServer.close();
                console.log('Bye bye');
                process.exit(0);
            } catch (error) {
                console.error('Error on closing:', error.message);
            }
        });
    } catch (error) {
        console.error(error.message);
    }
};

main();
