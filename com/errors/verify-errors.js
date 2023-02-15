const { RequestVerificationError, DecodeTokenError, IsVerifiedError, IdDoesNotExistError, VerifyRequestFunctionError } = require("./errors");

class MissingTokenError extends DecodeTokenError {
    constructor() {
        super(`A token is required for authorization`)
    }
}

class InvalidTokenError extends DecodeTokenError {
    constructor(token) {
        super(`Invalid Token: ${token}`)
    }
}

class UndefinedDecodedJwtError extends DecodeTokenError {
    constructor() {
        super(`The token when decoded returned nothing`)
    }
}

class MissingAuthorizationHeaderError extends VerifyRequestFunctionError {
    constructor() {
        super("No Authorization Header Found")
    }
}

class MissingBearerError extends VerifyRequestFunctionError {
    constructor() {
        super(`Expected the authorization header to have 'Bearer'`)
    }
}

class NotVerifiedError extends VerifyRequestFunctionError {
    constructor() {
        super(`This request was unabled to be processed, because you were not verified`)
    }
}

module.exports = {
    MissingTokenError,
    InvalidTokenError,
    UndefinedDecodedJwtError,
    MissingAuthorizationHeaderError,
    MissingBearerError,
    NotVerifiedError
}