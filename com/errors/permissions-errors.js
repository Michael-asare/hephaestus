const { ERROR_404, ERROR_500 } = require("./errors");

class OneToManyPermissionCodeMappingError extends ERROR_500 {
    constructor(permissionCode) {
        super(`There was multiple ids found for ${permissionCode}`)
    }
}
class ZeroPermissionIdsFound extends ERROR_404 {
    constructor(permissionCode) {
        super(`There were no permission ids found for ${permissionCode}`)
    }
}

module.exports = {
    OneToManyPermissionCodeMappingError,
    ZeroPermissionIdsFound
}