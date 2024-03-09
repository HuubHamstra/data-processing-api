const jwt = require("jsonwebtoken");
const { secretKey } = require("./config");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).send({ error: "Forbidden" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
