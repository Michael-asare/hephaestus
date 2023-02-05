const PORTLESS_URL = `${process.env.APP_URL}`
const PORT = process.env.PORT || 3001

const AUTH = process.env.AUTH_TABLE_NAME
const ACCOUNT_VERIFY = process.env.ACCOUNT_VERIFY_TABLE_NAME
const PASSWORD_RESET = process.env.PASSWORD_RESET

module.exports = {
    PORT: PORT,
    BASE_URL: `${PORTLESS_URL}:${PORT}`,
    CONNECTION_STRING: `${process.env.DATABASE_URL}`,
    JWT_SECRET: `${process.env.JWT_SECRET}`,
    TABLE: {
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
        }
    },
    VERIFY_TOKEN_EXPIRE: {
        amount: 1,
        unit: "day"
    },
    PASSWORD_RESET_TOKEN_EXPIRE: {
        amount: 1,
        unit: "hour"
    },
    EMAIL: {
        user: `${process.env.EMAIL_USER}`,
        password: `${process.env.EMAIL_PASSWORD}`,
    }
}