const { ERROR_400, ERROR_410, ERROR_404 } = require("./errors");

class UnassociatedEmailError extends ERROR_400 {
    constructor(email) {
        super(`Email ${email} is not actually associated with any account`)
    }
}

class ResetTokenDoesNotExistError extends ERROR_404 {
    constructor(token) {
        super(`Token ${token} could not be found`)
    }
}

class ResetTokenExpiredError extends ERROR_410 {
    constructor() {
        super(`Verification code is expired`)
    }
}

module.exports = {
    UnassociatedEmailError,
    ResetTokenDoesNotExistError,
    ResetTokenExpiredError,
}