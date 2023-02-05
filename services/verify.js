const jwt = require("jsonwebtoken")
const config = require("../config")
const pool = require("../db")
const JWT_SECRET = config.JWT_SECRET
const AUTH_TABLE_NAME = config.TABLE.AUTH.name

const decode_token = (token) => {
    if (!token) {
        throw new Error(`A Token is Required For Authorization`)
    }
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (err) {
        throw new Error(`Invalid Token: ${token}`)
    }
}

const is_verified = async (id) => {
    if (!id) {
        throw new Error("An id was not given")
    }

    try {
        const result = await pool.query(`SELECT verified FROM ${AUTH_TABLE_NAME} WHERE id = $1`, [id])
        if (result.rowCount == 0) {
            throw new Error("No rows found with that id")
        }
        const verified = result.rows[0].verified
        return verified
    } catch (err) {
        console.error("An error occured while checking verification status")
        throw new err;
    }
}

module.exports = {
    decode_token, is_verified
}