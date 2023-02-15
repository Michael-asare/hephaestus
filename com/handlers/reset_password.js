const resetPasswordService = require("../services/reset_password")
const verifyService = require("../services/verify");
const { basic_error_handler, throw_eror_if_fields_not_here } = require("./util");

const request_password_reset = async (request, response) => {
    try {
        const { email } = request.body;
        throw_eror_if_fields_not_here({email})
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
        
        throw_eror_if_fields_not_here({password, token})
        await resetPasswordService.update_password_with_reset_token(password, token)
        
        return response.json({
            message: "Nice job resetting your password!"
        })
    } catch (err) {
        return basic_error_handler(response, err)
    }
}

const update_password_after_sign_in = async (request, response) => {
    try {
        const { newPassword } = request.body
        throw_eror_if_fields_not_here({newPassword})
        const decoded_jwt = await verifyService.verify_request(request)
        const id = decoded_jwt.id

        await resetPasswordService.update_password_by_id(id, newPassword)

        return response.json({
            message: "Password has been updated!"
        })
    } catch(err) {
        return basic_error_handler(response, err)
    }
}

module.exports = {
    request_password_reset, update_after_reset_password, update_password_after_sign_in
}