const pool = require("../../setup/db")
const helper = require("./helper")
const config = require("../../setup/config")
const authService = require("./auth");
const { FailedQueryError, AttributeMissingError, IdDoesNotExistError } = require("../errors/errors");
const { OneToManyPermissionCodeMappingError, ZeroPermissionIdsFound } = require("../errors/permissions-errors");

const PERMISSIONS_TABLE_NAME = config.TABLE.PERMISSIONS.name;
const USER_PERMISSIONS_TABLE_NAME = config.TABLE.USER_PERMISSIONS.name;

const PERMISSION_ENUMS = Object.freeze({
    ADMIN: "ADMIN"
})


const create_new_permission = async (newPermissionCode) => {
    try {
        await pool.query(`INSERT INTO ${PERMISSIONS_TABLE_NAME} (permission_code) VALUES ($1)`, [newPermissionCode])
    } catch (err) {
        console.error("Probably tried to insert a permission code that already exists")
        throw err;
    }
}

const get_permission_id = async (permissionCode) => {
    const permissionResult = await pool.query(`SELECT permission_id FROM ${PERMISSIONS_TABLE_NAME} WHERE permission_code = $1`, [permissionCode])
    if (!permissionResult) {
        throw new FailedQueryError(`Permission code to permission id conversion failed for ${permissionCode}`)
    }
    if (permissionResult.rowCount > 1) {
        throw new OneToManyPermissionCodeMappingError(permissionCode)
    }
    if (permissionResult.rowCount == 0) {
        throw new ZeroPermissionIdsFound(permissionCode)
    }

    if (!permissionResult.rows[0].permission_id) {
        // throw new Error(`The permission id was not generated`)
        throw new AttributeMissingError("get_permission_id", "permission_id", `permissionCode=${permissionCode}`)
    }
    return permissionResult.rows[0].permission_id
}

const delete_permission = async (permissionCode) => {
    try {
        const permissionId = await get_permission_id(permissionCode)
        await pool.query(`DELETE FROM ${USER_PERMISSIONS_TABLE_NAME} WHERE permission_id = $1`, permissionId)
        await pool.query(`DELETE FROM ${PERMISSIONS_TABLE_NAME} WHERE permission_code = $1`, permissionCode)
    } catch (err) {
        console.error("Probably tried to delete a permission code that does not exists")
        throw err;
    }
}

const grant_permission = async (email, permissionCode, expireDate) => {
    const id = await authService.email2Id(email)
    const permissionId = await get_permission_id(permissionCode)
    if (!id) {
        throw new IdDoesNotExistError(id)
    }

    try {
        if (!expireDate) {
            console.log(`Because expire date was = ${expireDate}, we'll presume as if this is infinity`)
            await pool.query(
                `INSERT INTO ${USER_PERMISSIONS_TABLE_NAME} (id, permission_id, expire_timestamp) VALUES ($1, $2, 'infinity'::timestamp) ON CONFLICT (id, permission_id) DO UPDATE SET expire_timestamp = EXCLUDED.expire_timestamp`, 
                [id, permissionId])
        } else {
            console.log(`Expire date for this permission is ${expireDate}`)
            await pool.query(`INSERT INTO ${USER_PERMISSIONS_TABLE_NAME} (id, permission_id, expire_timestamp) VALUES ($1, $2, $3) ON CONFLICT (id, permission_id) DO UPDATE SET expire_timestamp = EXCLUDED.expire_timestamp`, [id, permissionId, expireDate])
        }
    } catch (err) {
        // console.error(err)
        console.error(`An error occured while granting the permission ${permissionCode} for ${email}`)
        throw err
    }
}

const revoke_permission = async (email, permissionCode) => {
    const id = await authService.email2Id(email)
    const permissionId = await get_permission_id(permissionCode)

    if (!id) {
        throw new IdDoesNotExistError(id)
    }
    try {
        await pool.query(`DELETE FROM ${USER_PERMISSIONS_TABLE_NAME} WHERE id = $1 AND permission_id = $2 RETURNING *`, [id, permissionId])
    } catch (err) {
        console.error(err)
        console.error(`An error occured while revoking the permission ${permissionCode} for ${email}`)
        throw err
    }
}

const has_permission = async (id, permissionCode) => {
    const permissionId = await get_permission_id(permissionCode)
    try {
        console.log("Clearing out expired permissions")
        await pool.query(`DELETE FROM ${USER_PERMISSIONS_TABLE_NAME} WHERE expire_timestamp < now()`)
        const result = await pool.query(`SELECT * FROM ${USER_PERMISSIONS_TABLE_NAME} WHERE id = $1 AND permission_id = $2`, [id, permissionId])
    
        if(!result) {
            throw new FailedQueryError("Permission check query returned nothing")
        }
    
        return result.rowCount == 1
    } catch (err) {
        console.error(err)
        console.error(`An error occured while checking the permission ${permissionCode} for ${email}`)
        throw err
    }
}

const has_all_permisisons = async (id, permissionCodes) => {
    const permissionChecks = await Promise.all(permissionCodes.map((permissionCode) => {
        return has_permission(id, permissionCode)
    }))
    return permissionChecks.reduce((currentState, permissionCheck) => {
        return currentState && permissionCheck
    })
}

const is_admin = async (id) => {
    console.log("Currently in dev mode. Every id is an admin")
    return true
    return await has_permission(id, PERMISSION_ENUMS.ADMIN)
}

module.exports = {
    create_new_permission, grant_permission, delete_permission, revoke_permission, has_permission, has_all_permisisons, is_admin
}
