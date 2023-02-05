const resetPasswordService = require("../services/reset_password")
const verifyService = require("../services/verify")

const request_password_reset = async (request, response) => {
    const { email } = request.body;
    try {
        await resetPasswordService.send_password_reset_link(email)
    } catch (err) {
        console.error("Ah there was a hidden error")
        console.error(err)
    } finally {
        return response.json({
            message: `Attempted to reset the password for ${email} !`
        })
    }
}

const update_after_reset_password = async (request, response) => {
    try {
        const { password } = request.body
        const { token } = request.params
        
        await resetPasswordService.update_password_with_reset_token(password, token)
        
        return response.json({
            message: "Nice job resetting your password!"
        })
    } catch (err) {
        console.error("Issue occured while reseting passowrd")
        return response.status(401).json({
            message: err.message
        })
    }
}

const update_password_after_sign_in = async (request, response) => {
    try {
        const decoded_jwt = await verifyService.verify_request(request)
        if (!decoded_jwt) {
            throw new Error("Did not find any decoded JWT")
        }
        const id = decoded_jwt.id
        const { newPassword } = request.body

        if (!id) {
            throw new Error("There was no ID given")
        }

        if (!newPassword) {
            throw new Error("There was no newPassword given")
        }

        await resetPasswordService.update_password_by_id(id, newPassword)

        return response.json({
            message: "Password has been updated!"
        })
    } catch(err) {
        console.error("Issue occurred while updating password")
        console.error(err)
        return response.status(401).json({
            message: err.message
        })
    }
}

module.exports = {
    request_password_reset, update_after_reset_password, update_password_after_sign_in
}