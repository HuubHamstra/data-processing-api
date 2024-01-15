const crypto = require('crypto');

// Generate a secret key
const secretKey = crypto.randomBytes(64).toString('hex');

// Dummy database to store refresh tokens
const refreshTokens = {};

module.exports = { secretKey, refreshTokens };