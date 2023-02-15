const permissionService = require("../services/permissions")
const verifyService = require("../services/verify")
const { basic_error_handler, throw_eror_if_fields_not_here } = require("./util")

const create_new_permission = async (request, response) => {
    try {
        const decoded_jwt = await verifyService.verify_request(request)
        const id = decoded_jwt.id
        const { newPermissionCode } = request.body
        throw_eror_if_fields_not_here({newPermissionCode})

        if (permissionService.is_admin(id)) {
            await permissionService.create_new_permission(newPermissionCode)
            return response.json({
                message: `You have successfully created the permission ${newPermissionCode}`
            })
        }

        return response.json({
            message: `Here is the permission code you filthy animal ${newPermissionCode}`
        })

    } catch (err) {
        return basic_error_handler(response, err)
    }
}

const grant_permission = async (request, response) => {
    try {
        const decoded_jwt = await verifyService.verify_request(request)
        const id = decoded_jwt.id
        const { permissionCode, subjectEmail, expireDate } = request.body
        throw_eror_if_fields_not_here({permissionCode, subjectEmail})

        if (permissionService.is_admin(id)) {
            await permissionService.grant_permission(subjectEmail, permissionCode, expireDate)
            return response.json({
                message: `You have successfully granted the permission ${permissionCode}`
            })
        }
    } catch (err) {
        return basic_error_handler(response, err)
    }
}
const revoke_permission = async (request, response) => {
    try {
        const decoded_jwt = await verifyService.verify_request(request)
        const id = decoded_jwt.id
        const { permissionCode, subjectEmail } = request.body
        throw_eror_if_fields_not_here({permissionCode, subjectEmail})
    
        if (permissionService.is_admin(id)) {
            await permissionService.revoke_permission(subjectEmail, permissionCode)
            return response.json({
                message: `You have successfully revoked the permission ${permissionCode} from ${subjectEmail}`
            })
        }
    } catch (err) {
        return basic_error_handler(response, err)
    }
}

const check_permissions = async (request, response) => {
    try {
        const decoded_jwt = await verifyService.verify_request(request)
        const id = decoded_jwt.id
    
        const { permissionCodes } = request.body
        throw_eror_if_fields_not_here({permissionCodes})
        if (permissionService.has_all_permisisons(id, permissionCodes)) {
            return response.json({
                message: `You have all the permissions listed`
            })
        } else {
            return response.json({
                message: `You DON"T have these permissions.`
            })
        }
    } catch (err) {
        return basic_error_handler(response, err)
    }    
}

const is_admin = async (request, response) => {
    try {
        const decoded_jwt = await verifyService.verify_request(request)
        const id = decoded_jwt.id
    
        const { permissionCodes } = request.body
        throw_eror_if_fields_not_here({permissionCodes})
        if (permissionService.is_admin(id)) {
            await permissionService.has_all_permisisons(id, permissionCodes)
            if (permissionService.is_admin(id)) {
                return response.json({
                    message: `You have all the permissions listed (admin)`
                })
            } else {
                return response.json({
                    message: `You DON"T have these permissions. (admin)`
                })
            }
        }
    } catch (err) {
        return basic_error_handler(response, err)
    }    
}

module.exports = {
    create_new_permission, grant_permission, revoke_permission, check_permissions, is_admin
}