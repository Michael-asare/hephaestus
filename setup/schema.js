const AUTH = process.env.AUTH_TABLE_NAME
const ACCOUNT_VERIFY = process.env.ACCOUNT_VERIFY_TABLE_NAME
const PASSWORD_RESET = process.env.PASSWORD_RESET_TABLE_NAME
const PERMISSIONS = process.env.PERMISSIONS_TABLE_NAME
const USER_PERMISSIONS = process.env.USER_PERMISSIONS_TABLE_NAME

module.exports = {
    AUTH: {
        name: AUTH,
        creation: `CREATE TABLE IF NOT EXISTS ${AUTH} (
                id serial PRIMARY KEY,
                email text UNIQUE NOT NULL,
                hashed_password text NOT NULL,
                salt text NOT NULL,
                verified boolean NOT NULL DEFAULT False)`,
    },
    ACCOUNT_VERIFY: {
        name: ACCOUNT_VERIFY,
        creation: `CREATE TABLE IF NOT EXISTS ${ACCOUNT_VERIFY} (
                id serial PRIMARY KEY REFERENCES ${AUTH} (id),
                code text NOT NULL,
                entry_timestamp timestamptz NOT NULL DEFAULT now()
            )`
    },
    PASSWORD_RESET: {
        name: PASSWORD_RESET,
        creation: `CREATE TABLE IF NOT EXISTS ${PASSWORD_RESET} (
                email text NOT NULL,
                hashed_code text NOT NULL,
                entry_timestamp timestamptz NOT NULL DEFAULT now()
            )`
    },
    PERMISSIONS: {
        name: PERMISSIONS,
        creation: `CREATE TABLE IF NOT EXISTS ${PERMISSIONS} (
                permission_id serial PRIMARY KEY NOT NULL,
                permission_code text UNIQUE NOT NULL
            )`
    },
    USER_PERMISSIONS: {
        name: USER_PERMISSIONS,
        creation: `CREATE TABLE IF NOT EXISTS ${USER_PERMISSIONS} (
                id serial REFERENCES ${AUTH} (id),
                permission_id serial REFERENCES ${PERMISSIONS} (permission_id),
                expire_timestamp timestamptz NOT NULL,
                UNIQUE (id, permission_id)
            )`
    },
}