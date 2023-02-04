const pool = require("../db")
const helper = require("./helper")
const config = require("../config")
const crypto = require("crypto");

const AUTH_TABLE_NAME = config.TABLE.AUTH.name;
const AUTH_TABLE_CREATION = config.TABLE.AUTH.creation;

const wrapped_pbkdf2 = (password, salt) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, derivedPassword) => {
            if (err) {
                reject(err)
            } else {
                resolve(derivedPassword.toString('hex'))
            }
        })
    })
}

const generate_salt = () => {
    return crypto.randomBytes(16).toString('hex')
}

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

const signup = async (email, password) => {
    let salt = generate_salt()

    let hashedPassword = await wrapped_pbkdf2(password, salt)

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
        console.error("For some reason, the new user row does not exist")
        throw new Error("For some reason, the new user row does not exist");
    }
    return newUserRow;
}

const verifyPassword = async (email, password) => {
    try {
        await pool.query(AUTH_TABLE_CREATION)
    } catch (err) {
        console.error("Could not create authorization table.")
        throw err;
    }

    let row;
    try {
        const result = await pool.query(`SELECT * FROM ${AUTH_TABLE_NAME} WHERE email = $1`, [email])
        row = result.rows[0];
    } catch (err) {
        console.error("Could not find email")
        throw err;
    }

    if (row == null || row == undefined) {
        console.error("The row does not exist")
        throw new Error("The row does not exist");
    }

    try {
        let derivedPassword = await wrapped_pbkdf2(password, row.salt)
        if (!crypto.timingSafeEqual(Buffer.from(row.hashed_password), Buffer.from(derivedPassword))) {
            throw new Error("The password was not the same as what we thought it should be.")
        }
        return row
    } catch (err) {
        console.error("Something went wrong while trying to generate a hashed password.")
        throw err;
    }
}

module.exports = {
    signup, verifyPassword
}