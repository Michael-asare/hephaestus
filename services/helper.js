const pool = require("../db")
const nodemailer = require("nodemailer")
const config = require("../config")

const grab_all_rows = async (table_name) => {
    return await pool.query(`SELECT * FROM ${table_name}`)
}

const delete_all_rows = async (table_name) => {
    await pool.query(`DELETE FROM ${table_name}`)
}

const create_table_if_not_exists = async (table_creation_query) => {
    try {
        await pool.query(table_creation_query)
    } catch (err) {
        console.error("Could not create table")
        throw err;
    }
}

const drop_table = async (table_name) => {
    await pool.query(`DROP TABLE ${table_name}`)
}

const send_email = async (recipentEmail, subject, plainText, html) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: config.EMAIL.user,
            pass: config.EMAIL.password
        }
    })

    const info = await transporter.sendMail({
        from: config.EMAIL.user,
        to: recipentEmail,
        subject: subject,
        plainText: plainText,
        html: html
    })

    return info
}

module.exports = {
    delete_all_rows, grab_all_rows, drop_table, create_table_if_not_exists, send_email
}