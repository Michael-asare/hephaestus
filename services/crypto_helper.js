const crypto = require("crypto");

const wrapped_pbkdf2 = (password, salt) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, derivedPassword) => {
            if (err) {
                reject(err)
            } else {
                resolve(derivedPassword.toString('hex'))
            }
        })
    })
}

const generate_bytes = (len) => {
    if (!len) {
        len = 16;
    }
    return crypto.randomBytes(len).toString('hex')
}

const generate_salt = () => {
    return generate_bytes()
}

const wrapped_timingSafeEqual = (string1, string2) => {
    return crypto.timingSafeEqual(Buffer.from(string1), Buffer.from(string2))
}

module.exports = {
    wrapped_pbkdf2, generate_bytes, generate_salt, wrapped_timingSafeEqual
}