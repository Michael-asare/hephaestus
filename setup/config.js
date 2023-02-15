const schema = require("./schema")
const PORTLESS_URL = `${process.env.APP_URL}`
const PORT = process.env.PORT || 3001

module.exports = {
    PORT: PORT,
    BASE_URL: `${PORTLESS_URL}:${PORT}`,
    CONNECTION_STRING: `${process.env.DATABASE_URL}`,
    JWT_SECRET: `${process.env.JWT_SECRET}`,
    TABLE: schema,
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