AUTH = "auth"

module.exports = {
    CONNECTION_STRING: `${process.env.DATABASE_URL}`,
    JWT_SECRET: `${process.env.JWT_SECRET}`,
    TABLE: {
        AUTH: {
            name: AUTH,        
            creation: `CREATE TABLE IF NOT EXISTS ${AUTH} (
                id serial PRIMARY KEY,
                email text UNIQUE NOT NULL,
                hashed_password text NOT NULL,
                salt text NOT NULL
            )`,
        }
    }
}