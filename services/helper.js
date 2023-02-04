const pool = require("../db")

const grab_all_rows = async (table_name) => {
    return await pool.query(`SELECT * FROM ${table_name}`)
}

const delete_all_rows = async (table_name) => {
    await pool.query(`DELETE FROM ${table_name}`)
}

module.exports = {
    delete_all_rows, grab_all_rows
}