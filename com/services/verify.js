const jwt = require("jsonwebtoken")
const config = require("../../setup/config")
const pool = require("../../setup/db")
const { IdUndefinedError, IdDoesNotExistError } = require("../errors/errors")
const { MissingTokenError, InvalidTokenError, UndefinedDecodedJwtError, MissingAuthorizationHeaderError, MissingBearerError, NotVerifiedError } = require("../errors/verify-errors")
const JWT_SECRET = config.JWT_SECRET
const AUTH_TABLE_NAME = config.TABLE.AUTH.name

const decode_token = (token) => {
    if (!token) {
        throw new MissingTokenError()
    }
    try {
        const decoded_jwt =  jwt.verify(token, JWT_SECRET)
        if (!decoded_jwt) {
            throw UndefinedDecodedJwtError()
        }
        return decoded_jwt
    } catch (err) {
        throw new InvalidTokenError(token)
    }
}

const is_verified = async (id) => {
    if (!id) {
        throw new IdUndefinedError("is_verified")
    }

    try {
        const result = await pool.query(`SELECT verified FROM ${AUTH_TABLE_NAME} WHERE id = $1`, [id])
        if (result.rowCount == 0) {
            throw new IdDoesNotExistError(id)
        }
        const verified = result.rows[0].verified
        return verified
    } catch (err) {
        console.error("An error occured while checking verification status")
        throw err;
    }
}

const verify_request = async (request) => {
    const authorizationHeader = request.header("authorization")
    if (!authorizationHeader) {
        throw new MissingAuthorizationHeaderError()
    }

    const lineSplit = authorizationHeader.split(' ')
    const bearer = lineSplit[0]
    if (bearer != "Bearer") {
        throw new MissingBearerError()
    }
    const token = lineSplit[1]
    const decoded_token = decode_token(token)
    const id = decoded_token.id
    if (!(await is_verified(id))) {
        throw new NotVerifiedError()
    }

    return decoded_token
}

module.exports = {
    decode_token, is_verified, verify_request
}