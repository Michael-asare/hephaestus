const pool = require("../../setup/db")
const helper = require("./helper")
const config = require("../../setup/config")
const cryptoHelper = require("./crypto_helper")
const verifyService = require("./verify")
const moment = require("moment")
const { EmailAlreadyExistsError, PasswordsDoNotMatchError, UndefinedAccountIdError, UndefinedVerificationCodeError, AlreadyVerifiedError, ExpiredVerificationCodeError } = require("../errors/auth-errors")
const { RowUndefinedError, IdUndefinedError, EmailUndefinedError, AttributeMissingError } = require("../errors/errors")

const AUTH_TABLE_NAME = config.TABLE.AUTH.name;

const ACCOUNT_VERIFY_TABLE_NAME = config.TABLE.ACCOUNT_VERIFY.name;

const throw_error_if_email_exists = async (email) => {
    try {
        const rows = await pool.query(`SELECT email FROM ${AUTH_TABLE_NAME} WHERE email = $1`, [email])
        if (rows.rowCount >= 1) {
            throw new EmailAlreadyExistsError(email)
        }
    } catch (err) {
        throw err
    }
}

const generate_verify_code = async (id) => {
    const random_string = cryptoHelper.generate_bytes(32)
    try {
        return await pool.query(`INSERT INTO ${ACCOUNT_VERIFY_TABLE_NAME} (id, code) VALUES ($1, $2) RETURNING *`, [id, random_string])
    } catch (err) {
        throw err
    }
}

const signup = async (email, password) => {
    let [hashedPassword, salt] = await cryptoHelper.create_hashed_password(password)

    // await helper.delete_all_rows(ACCOUNT_VERIFY_TABLE_NAME)
    // await helper.delete_all_rows(AUTH_TABLE_NAME)
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
    if (!newUserRow) {
        throw new RowUndefinedError("signup");
    }
    if (!newUserRow.id) {
        throw new AttributeMissingError("signup", "id", "email="+email)
    }
    const id = newUserRow.id
    const verify_code_result = await generate_verify_code(id)
    const code = verify_code_result.rows[0].code


    const verificationLink = `${config.BASE_URL}/verify_account/${id}/${code}`
    const emailInfo = await helper.send_email(email, "Verify Your Acccount w/ FantasyFiends & TMS!", `Here is your link: ${verificationLink}`, `<p>${verificationLink}</p>`)
    console.log("This is the email info")
    console.log(emailInfo)

    return newUserRow;
}

const verifyPassword = async (email, password) => {
    let row;
    try {
        const result = await pool.query(`SELECT * FROM ${AUTH_TABLE_NAME} WHERE email = $1`, [email])
        row = result.rows[0];
    } catch (err) {
        console.error("An error occured while looking up email")
        throw err;
    }

    if (row == null || row == undefined) {
        throw new RowUndefinedError('verifyPassword');
    }

    try {
        let derivedPassword = await cryptoHelper.wrapped_pbkdf2(password, row.salt)
        if (!cryptoHelper.wrapped_timingSafeEqual(row.hashed_password, derivedPassword)) {
            throw new PasswordsDoNotMatchError()
        }
        return row
    } catch (err) {
        console.error("Something went wrong while trying to generate a hashed password.")
        throw err;
    }
}

const accountVerification = async (accountId, verificationCode) => {
    if (!accountId) {
        throw new IdUndefinedError("accountVerification")
    }

    if (!verificationCode) {
        throw new UndefinedVerificationCodeError()
    }

    const is_already_verified = await verifyService.is_verified(accountId)
    if (is_already_verified) {
        throw new AlreadyVerifiedError(accountId)
    }
    const result = await pool.query(`SELECT * FROM ${ACCOUNT_VERIFY_TABLE_NAME} WHERE id = $1 AND code = $2`, [accountId, verificationCode])
    const row = result.rows[0]

    if (row == null || row == undefined) {
        // throw new RowUndefinedError("Could not find an account with a living verifcation code with that id. That code may be expired or wrong.");
        throw new RowUndefinedError("accountVerification");
    }

    entry_moment = moment(row.entry_timestamp)
    expire_moment = moment(row.entry_timestamp).add(config.VERIFY_TOKEN_EXPIRE.amount, config.VERIFY_TOKEN_EXPIRE.unit)
    if (!moment().isBetween(entry_moment, expire_moment, undefined, "[]")) {
        await pool.query(`DELETE FROM ${ACCOUNT_VERIFY_TABLE_NAME} WHERE id = $1 AND entry_timestamp < now()`, [accountId])
        throw new ExpiredVerificationCodeError()
    }
    await pool.query(`DELETE FROM ${ACCOUNT_VERIFY_TABLE_NAME} WHERE id = $1`, [accountId])
    await pool.query(`UPDATE ${AUTH_TABLE_NAME} SET verified = True WHERE id = $1`, [accountId])
}

const id2Email = async (id) => {
    if (!id) {
        throw new IdUndefinedError("id2Email")
    }

    const result = await pool.query(`SELECT email FROM ${AUTH_TABLE_NAME} WHERE id = $1`, [id])
    const row = result.rows[0]

    if (!row) {
        throw new RowUndefinedError("id2Email")
    }

    if (!row.email) {
        throw new AttributeMissingError("id->email", "email", `id=${id}`)
    }
    return row.email
}
const email2Id = async (email) => {
    if (!email) {
        throw new EmailUndefinedError("email2Id")
    }

    const result = await pool.query(`SELECT id FROM ${AUTH_TABLE_NAME} WHERE email = $1`, [email])
    const row = result.rows[0]

    if (!row) {
        throw new RowUndefinedError("email2Id")
    }

    if (!row.id) {
        throw new AttributeMissingError("email->id", "id", `email=${email}`)
    }
    return row.id
}

module.exports = {
    signup, verifyPassword, accountVerification, id2Email, email2Id
}