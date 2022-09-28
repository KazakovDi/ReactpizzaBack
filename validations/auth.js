const { body } = require("express-validator" ) 

const authValidation = [
    body("email", "Некорректный email").isEmail(),
    body("password", "Слишком короткий/длинный пароль").isLength({min:3, max:12}),
]

module.exports = authValidation