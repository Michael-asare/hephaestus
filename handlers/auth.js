const authService = require("../services/auth")
const config = require("../config")
const jwt = require("jsonwebtoken")

const JWT_SECRET = config.JWT_SECRET

const signup = async (request, response) => {
    try {
        const { email, password } = request.body;
        console.log(`${email} is trying to signup...`)

        const row = await authService.signup(email, password);
        if (row != null) {
            const id = row.id
            return response.json({
                token: jwt.sign({ user: id }, JWT_SECRET)
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
            return response.json({
                token: jwt.sign({ user: id }, JWT_SECRET)
            })
        }

        return response.status(401).json({ message: "The username and password your provided are invalid" });
    } catch (err) {
        console.error(err)
        return response.status(401).json({ message: err.message });
    }
}

module.exports = {
    signup, login
}