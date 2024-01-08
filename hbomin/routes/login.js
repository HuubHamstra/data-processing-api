const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const secretKey = crypto.randomBytes(64).toString('hex');
console.log('Special JWT-key:', secretKey);

// Handle POST request for login
router.post('/', (req, res) => {
  const { email, password } = req.body;

  // Dummy authentication
  if (email === 'user@example.com' && password === 'password') {
    // Generate JWT token upon successful login
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

module.exports = router;
