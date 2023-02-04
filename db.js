const { Pool } = require("pg");
const config = require("./config")
const pool = new Pool({connectionString: config.CONNECTION_STRING});

module.exports = pool