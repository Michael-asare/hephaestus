const pool = require("../db")
const helper = require("./helper")
const config = require("../config")
const cryptoHelper = require("./crypto_helper")
const moment = require("moment")

const AUTH_TABLE_NAME = config.TABLE.AUTH.name;
const AUTH_TABLE_CREATION = config.TABLE.AUTH.creation;

const ACCOUNT_VERIFY_TABLE_NAME = config.TABLE.ACCOUNT_VERIFY.name;
const ACCOUNT_VERIFY_TABLE_CREATION = config.TABLE.ACCOUNT_VERIFY.creation;

const throw_error_if_email_exists = async (email) => {
    try {
        const rows = await pool.query(`SELECT email FROM ${AUTH_TABLE_NAME} WHERE email = $1`, [email])
        if (rows.rowCount >= 1) {
            throw new Error(`An account with ${email} already exists`)
        }
    } catch (err) {
        throw err
    }
}

const create_account_verify_table = async () => {
    await helper.create_table_if_not_exists(ACCOUNT_VERIFY_TABLE_CREATION)
}

const generate_verify_code = async (id) => {
    await create_account_verify_table()
    const random_string = cryptoHelper.generate_bytes(32)
    try {
        return await pool.query(`INSERT INTO ${ACCOUNT_VERIFY_TABLE_NAME} (id, code) VALUES ($1, $2) RETURNING *`, [id, random_string])
    } catch (err) {
        throw err
    }
}

const create_auth_table = async () => {
    await helper.create_table_if_not_exists(AUTH_TABLE_CREATION)
}

const signup = async (email, password) => {
    await create_auth_table()

    let salt = cryptoHelper.generate_salt()

    let hashedPassword = await cryptoHelper.wrapped_pbkdf2(password, salt)

    await helper.delete_all_rows(ACCOUNT_VERIFY_TABLE_NAME)
    await helper.delete_all_rows(AUTH_TABLE_NAME)
    await throw_error_if_email_exists(email)

    let newUserRows;
    try {
        let result = await pool.query(`INSERT INTO ${AUTH_TABLE_NAME} (email, hashed_password, salt) VALUES ($1, $2, $3) RETURNING *`, [email, hashedPassword, salt])
        newUserRows = result.rows;
    } catch (err) {
        console.error(`Could not insert ${email} as a new account`)
        throw err;
    }
    const newUserRow = newUserRows[0];
    if (newUserRow == null || newUserRow == undefined) {
        throw new Error("For some reason, the new user row does not exist");
    }

    const id = newUserRow.id
    const verify_code_result = await generate_verify_code(id)
    const code = verify_code_result.rows[0].code

    console.log("This is your ID")
    console.log(id)
    console.log("This is your code")
    console.log(code)

    return newUserRow;
}

const verifyPassword = async (email, password) => {
    await create_auth_table()

    let row;
    try {
        const result = await pool.query(`SELECT * FROM ${AUTH_TABLE_NAME} WHERE email = $1`, [email])
        row = result.rows[0];
    } catch (err) {
        console.error("An error occured while looking up email")
        throw err;
    }

    if (row == null || row == undefined) {
        throw new Error("Could not find email");
    }

    try {
        let derivedPassword = await cryptoHelper.wrapped_pbkdf2(password, row.salt)
        if (!cryptoHelper.wrapped_timingSafeEqual(row.hashed_password, derivedPassword)) {
            throw new Error("The password was not the same as what we thought it should be.")
        }
        return row
    } catch (err) {
        console.error("Something went wrong while trying to generate a hashed password.")
        throw err;
    }
}

const accountVerification = async (accountId, verificationCode) => {
    await create_account_verify_table()

    let row;
    try {
        const result = await pool.query(`SELECT * FROM ${ACCOUNT_VERIFY_TABLE_NAME} WHERE id = $1 AND code = $2`, [accountId, verificationCode])
        row = result.rows[0]
    } catch (err) {
        throw err;
    }

    if (row == null || row == undefined) {
        throw new Error("Could not find an account with a living verifcation code with that id. That code may be expired or wrong.");
    }

    console.log(row.entry_timestamp)
    entry_moment = moment(row.entry_timestamp)
    expire_moment = moment(row.entry_timestamp).add(config.VERIFY_TOKEN_EXPIRE.amount, config.VERIFY_TOKEN_EXPIRE.unit)
    console.log(entry_moment)
    console.log(expire_moment)
    console.log(moment())
    if (!moment().isBetween(entry_moment, expire_moment, undefined, "[]")) {
        await pool.query(`DELETE FROM ${ACCOUNT_VERIFY_TABLE_NAME} WHERE id = $1 AND entry_timestamp < now()`, [accountId])
        throw new Error("The verification code expired")
    }
    await pool.query(`DELETE FROM ${ACCOUNT_VERIFY_TABLE_NAME} WHERE id = $1`, [accountId])
    await pool.query(`UPDATE ${AUTH_TABLE_NAME} SET verified = True WHERE id = $1`, [accountId])
}

module.exports = {
    signup, verifyPassword, accountVerification
}