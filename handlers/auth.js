const authService = require("../services/auth")
const config = require("../config")
const jwt = require("jsonwebtoken")

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
        console.log(`${email} is trying to signup...`)

        const row = await authService.signup(email, password);
        if (row != null) {
            const id = row.id
            return response.json({
                token: jwt.sign(payload_creator(id, email), JWT_SECRET)
            })
        }

        return response.status(401).json({ message: "SIGNUP The username and password your provided are invalid" });
    } catch (err) {
        console.error(err)
        return response.status(401).json({ message: "An error occured" });
    }
}

const login = async (request, response) => {
    try {
        const { email, password } = request.body;
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
        console.error(err)
        return response.status(401).json({ message: err.message });
    }
}

const verifyAccount = async (request, response) => {
    try {
        const { id, code } = request.params;
        console.log(`${id} is attempting to verify their credentials.`)

        await authService.accountVerification(id, code)
        return response.json({
            message: "YOU HAVE BEEN VERIFIED!!!"
        })
    } catch (err) {
        console.error(err)
        return response.status(401).json({ message: err.message })
    }
}

module.exports = {
    signup, login, verifyAccount
}