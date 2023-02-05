const jwt = require("jsonwebtoken")
const config = require("../config")
const JWT_SECRET = config.JWT_SECRET

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
