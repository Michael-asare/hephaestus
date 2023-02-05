const pool = require("../db")

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

module.exports = {
    delete_all_rows, grab_all_rows, drop_table, create_table_if_not_exists
}