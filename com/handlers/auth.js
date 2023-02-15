const authService = require("../services/auth")
const config = require("../../setup/config")
const jwt = require("jsonwebtoken")
const { basic_error_handler, throw_eror_if_fields_not_here } = require("./util")

const JWT_SECRET = config.JWT_SECRET

const payload_creator = (id, email) => {
    return {
        id: id,
        email: email,
    }
}

const signup = async (request, response) => {
    try {
        const { email, password } = request.body;
        throw_eror_if_fields_not_here({email, password})
        console.log(`${email} is trying to signup...`)

        const row = await authService.signup(email, password);
        const id = row.id
        return response.json({
            token: jwt.sign(payload_creator(id, email), JWT_SECRET)
        })

    } catch (err) {
        return basic_error_handler(response, err)
    }
}

const login = async (request, response) => {
    try {
        const { email, password } = request.body;
        throw_eror_if_fields_not_here({email, password})
        console.log(`${email} is trying to login...`)

        const row = await authService.verifyPassword(email, password);
        if (row != null) {
            const id = row.id
            console.log(row)
            return response.json({
                token: jwt.sign(payload_creator(id, email), JWT_SECRET)
            })
        }

        return response.status(401).json({ message: "The username and password your provided are invalid" });
    } catch (err) {
        return basic_error_handler(response, err)
    }
}

const verifyAccount = async (request, response) => {
    try {
        const { id, code } = request.params;
        throw_eror_if_fields_not_here({id, code})
        console.log(`${id} is attempting to verify their credentials.`)

        await authService.accountVerification(id, code)
        console.log(`${id} has successfully verified their credentials!`)
        return response.json({
            message: "YOU HAVE BEEN VERIFIED!!!"
        })
    } catch (err) {
        return basic_error_handler(response, err)
    }
}

module.exports = {
    signup, login, verifyAccount
}