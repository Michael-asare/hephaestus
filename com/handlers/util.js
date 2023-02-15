const { CUSTOM_ERROR, SERVER_ERROR, CLIENT_ERROR, MissingRequiredParameters } = require("../errors/errors")

const throw_eror_if_fields_not_here = (objectOfFields) => {
    let missingFields = []
    Object.entries(objectOfFields).forEach(([k, v]) => {
        if (!v) {
            missingFields.push(k)
        }
    })
    if (missingFields.length > 0) {
        throw new MissingRequiredParameters(missingFields.join())
    }
}

const basic_error_handler = (response, error) => {
    console.error(error)
    if (error instanceof CUSTOM_ERROR) {
        const statusCode = error.statusCode
        let message = "FILLER-MESSAGE"
        if (error instanceof SERVER_ERROR) {
            message = "A server error occured"
        } else {
            message = error.message
        }
        return response.status(statusCode).json({message})
    } else {
        return response.status(500).json({message: "An error occured"})
    }
}

module.exports = {
    throw_eror_if_fields_not_here,
    basic_error_handler
}