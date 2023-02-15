const helper = require("../com/services/helper")
const config = require("./config")

const init = async () => {
    let promises = []
    for (const [tableKey, tableData] of Object.entries(config.TABLE)) {
        const creation = tableData.creation
        if (creation) {
            promises.push(helper.create_table_if_not_exists(creation))
        }
    }
    return await Promise.all(promises)
}

module.exports = init

