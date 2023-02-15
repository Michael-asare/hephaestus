const { ERROR_409, ERROR_401, ERROR_404, SUCCESSFUL_200, ERROR_410 } = require("./errors")

class EmailAlreadyExistsError extends ERROR_409 {
    constructor(email) {
        super(`An account with ${email} already exists`)
    }
}

class PasswordsDoNotMatchError extends ERROR_401 {
    constructor() {
        super("Passwords did not match")
    }
}

class UndefinedVerificationCodeError extends ERROR_404 {
    constructor() {
        super("There was no verification code given to verify")
    }
}

class AlreadyVerifiedError extends SUCCESSFUL_200 {
    constructor(accountId) {
        super(`ID ${accountId} is already verified!`)
    }
}

class ExpiredVerificationCodeError extends ERROR_410 {
    constructor() {
        super(`The verification code expired`)
    }
}

module.exports = {
    EmailAlreadyExistsError, 
    PasswordsDoNotMatchError, 
    UndefinedVerificationCodeError,
    AlreadyVerifiedError,
    ExpiredVerificationCodeError
}