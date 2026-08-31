// Requirements
import { readFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
// eslint-disable-next-line import/named
import { Kysely, SqliteDialect } from 'kysely';


// Variables
const dbs = {};
const sqliteInstances = {};


// Internal
const getSchemaPath = () => path.join(path.dirname(fileURLToPath(import.meta.url)), '../../db/estructura.sql');


// Exported
export const dbApplySchema = (name = 'default') => {
    const sqlite = sqliteInstances[name];
    if (!sqlite) throw new Error(`DB ${name} not initialized`);
    const schema = readFileSync(getSchemaPath(), 'utf-8');
    sqlite.exec(schema);
};


export const dbInitialize = ({ filename }, name = 'default') => {
    const dir = path.dirname(path.resolve(filename));
    mkdirSync(dir, { recursive: true });

    const sqlite = new Database(filename);
    sqliteInstances[name] = sqlite;

    dbs[name] = new Kysely({
        dialect: new SqliteDialect({ database: sqlite }),
    });

    dbApplySchema(name);
};


export const dbClose = async (name = 'default') => {
    if (!dbs[name]) return;
    await dbs[name].destroy();
    delete dbs[name];
    delete sqliteInstances[name];
};


export const dbGet = (name = 'default') => {
    if (!dbs[name]) throw new Error(`DB ${name} not initialized`);
    return dbs[name];
};
