const pool = require("../../setup/db")
const helper = require("./helper")
const config = require("../../setup/config")
const cryptoHelper = require("./crypto_helper")
const moment = require("moment")
const { UnassociatedEmailError, ResetTokenDoesNotExistError, ResetTokenExpiredError } = require("../errors/reset-password-errors")
const { RowUndefinedError } = require("../errors/errors")

const AUTH_TABLE_NAME = config.TABLE.AUTH.name;

const PASSWORD_RESET_TABLE_NAME = config.TABLE.PASSWORD_RESET.name;

const send_password_reset_link = async (email) => {
    const random_string = cryptoHelper.generate_bytes(32)
    const hashed_random_string = cryptoHelper.generate_hash(random_string)
    let id
    try {
        const results = await pool.query(`SELECT id FROM ${AUTH_TABLE_NAME} WHERE email = $1`, [email])
        if (results.rowCount < 1) {
            throw new UnassociatedEmailError(email)
        }
        id = results.rows[0].id
    } catch (err) {
        throw err;
    }
    
    try {
        await pool.query(`INSERT INTO ${PASSWORD_RESET_TABLE_NAME} (email, hashed_code) VALUES ($1, $2) RETURNING *`, [email, hashed_random_string])
    } catch (err) {
        throw err
    }

    const passwordResetLink = `${config.BASE_URL}/reset_password/${random_string}`
    const emailInfo = await helper.send_email(email, "Here is your password reset link", `Here is your link: ${passwordResetLink}`, `<p>${passwordResetLink}</p>`)
    return emailInfo

}

const update_password_by_email = async (email, newPassword) => {
    let [hashedPassword, salt] = await cryptoHelper.create_hashed_password(newPassword)

    await pool.query(`UPDATE ${AUTH_TABLE_NAME} SET hashed_password = $1, salt = $2 WHERE email = $3`, [hashedPassword, salt, email])
}

const update_password_by_id = async (id, newPassword) => {
    let [hashedPassword, salt] = await cryptoHelper.create_hashed_password(newPassword)

    await pool.query(`UPDATE ${AUTH_TABLE_NAME} SET hashed_password = $1, salt = $2 WHERE id = $3`, [hashedPassword, salt, id])
}


const update_password_with_reset_token = async (newPassword, token) => {
    const hashed_token = cryptoHelper.generate_hash(token)
    let row
    try {
        const results = await pool.query(`SELECT * FROM ${PASSWORD_RESET_TABLE_NAME} WHERE hashed_code = $1`, [hashed_token])
        if (results.rowCount < 1) {
            throw ResetTokenDoesNotExistError(token)
        }
        row = results.rows[0]
    } catch (err) {
        throw err
    }

    if (!row) {
        throw new RowUndefinedError("update_password_with_reset_token")
    }

    const email = row.email
    entry_moment = moment(row.entry_timestamp)
    expire_moment = moment(row.entry_timestamp).add(config.VERIFY_TOKEN_EXPIRE.amount, config.VERIFY_TOKEN_EXPIRE.unit)
    if (!moment().isBetween(entry_moment, expire_moment, undefined, "[]")) {
        // await pool.query(`DELETE FROM ${PASSWORD_RESET_TABLE_NAME} WHERE email = $1 AND entry_timestamp < now()`, [email])
        throw new ResetTokenExpiredError()
    }
    await pool.query(`DELETE FROM ${PASSWORD_RESET_TABLE_NAME} WHERE email = $1`, [email])

    await update_password_by_email(email, newPassword)

}


module.exports = {
    send_password_reset_link, update_password_with_reset_token, update_password_by_id
}