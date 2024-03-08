const jwt = require('jsonwebtoken');
const { secretKey } = require("../routes/config");


async function loginAndGetToken() {
    const userCredentials = { username: 'test@test.test', password: 'test' };
    const token = jwt.sign(userCredentials, secretKey, { expiresIn: '1h' });
    return token;
}

module.exports = { loginAndGetToken };
