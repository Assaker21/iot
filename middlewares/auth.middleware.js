const jwt = require("jsonwebtoken");
const db = require("../db");

async function authMiddleware(req, res, next) {
  const token = req.headers["authorization"];
  console.log("Headers: ", req.headers["authorization"]);

  try {
    const verified = jwt.verify(token, "aoisjdpokpolaksd");
    if (verified) {
      req.user = jwt.decode(token);
      return next();
    }
  } catch {}

  return res.status(403).send("not nice");
}

module.exports = authMiddleware;
