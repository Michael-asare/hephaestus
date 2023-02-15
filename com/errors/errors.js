class CUSTOM_ERROR extends Error { 
    constructor(message) {
        super(message)
    }
 }
class STATUS_CODE_ERROR extends CUSTOM_ERROR {
    constructor(statusCode, message) {
        super(message)
        this.statusCode = statusCode
        if (!this.statusCode) {
            this.statusCode = 200
        }
    }
}
class SUCCESSFUL extends STATUS_CODE_ERROR { }
class SUCCESSFUL_200 extends SUCCESSFUL { constructor(message) { super(200, message) } }

class CLIENT_ERROR extends STATUS_CODE_ERROR { }

/**
 * Bad Request
 */
class ERROR_400 extends CLIENT_ERROR { constructor(message) { super(400, message) } }

/**
 * Unauthorized
 */
class ERROR_401 extends CLIENT_ERROR { constructor(message) { super(401, message) } }

/**
 * Not Found
 */
class ERROR_404 extends CLIENT_ERROR { constructor(message) { super(404, message) } }

/**
 * Conflict
 */
class ERROR_409 extends CLIENT_ERROR { constructor(message) { super(409, message) } }

/**
 * Gone
 */
class ERROR_410 extends CLIENT_ERROR { constructor(message) { super(410, message) } }

class SERVER_ERROR extends STATUS_CODE_ERROR { }
class ERROR_500 extends SERVER_ERROR { constructor(message) { super(500, message) } }

class FailedQueryError extends ERROR_500 {
    constructor(contextMessage) {
        super(contextMessage)
    }
}

class MissingRequiredParameters extends ERROR_400 { 
    constructor(missingFieldNames) {
        super(`This request couldn't be completed because these field names were missing: ${missingFieldNames}`)
    }
}

class RowUndefinedError extends ERROR_500 {
    constructor(contextMessage) {
        super(`The row fetched was undefined. Here is the context:\n${contextMessage}`)
    }
}

class IdUndefinedError extends ERROR_400 {
    constructor(contextMessage) {
        super(`There was no id given to ${contextMessage}`)
    }
}

class EmailUndefinedError extends ERROR_400 {
    constructor(contextMessage) {
        super(`There was no email given to ${contextMessage}`)
    }
}

class AttributeMissingError extends ERROR_500 {
    constructor(contextMessage, missingAttribute, extraInfo) {
        super(`During ${contextMessage}, ${missingAttribute} was not found. Additoinally: \n ${extraInfo}`)
    }
}

class IdDoesNotExistError extends ERROR_404 {
    constructor(id) {
        super(`There were no ids that matched ${id}`)
    }
}


class RequestVerificationError extends ERROR_401 { }

class DecodeTokenError extends RequestVerificationError { }
class IsVerifiedError extends RequestVerificationError { }
class VerifyRequestFunctionError extends RequestVerificationError { }

module.exports = {
    CUSTOM_ERROR,
    SUCCESSFUL,
    CLIENT_ERROR,
    SERVER_ERROR,
    SUCCESSFUL_200,
    ERROR_400,
    ERROR_401,
    ERROR_404,
    ERROR_409,
    ERROR_410,
    ERROR_500,
    FailedQueryError,
    IdUndefinedError,
    EmailUndefinedError,
    RowUndefinedError,
    MissingRequiredParameters,
    AttributeMissingError,
    IdDoesNotExistError,
    RequestVerificationError,
    DecodeTokenError,
    IsVerifiedError,
    VerifyRequestFunctionError,
}