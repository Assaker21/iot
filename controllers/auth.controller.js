const db = require("../db");
const jwt = require("jsonwebtoken");

async function authenticate(req, res) {
  console.log("REQUEST: AUTHENTICATION");
  const id = req.user.id;
  const [users] = await db.query("SELECT * FROM user WHERE id = ?", [id]);
  req.user = users[0];
  return res.send(req.user);
}

async function login(req, res) {
  const email = req.body?.email;
  const password = req.body?.password;

  if (!email || !password)
    return res.status(500).send("Email and password are required.");

  const [users] = await db.query(
    "SELECT * FROM user WHERE email = ? AND password = ?",
    [email, password]
  );

  if (users?.length > 0) {
    const user = { id: users[0].id };
    const token = jwt.sign(user, "aoisjdpokpolaksd", { expiresIn: "60m" });
    return res.send({ ...user, email: users[0].email, token: token });
  }

  return res.status(404).send("User not found.");
}

async function register(req, res) {
  const email = req.body?.email;
  const password = req.body?.password;

  if (!email || !password)
    return res.status(500).send("Email and password are required.");

  try {
    const [response] = await db.query(
      "INSERT INTO user (email, password) VALUES (?, ?)",
      [email, password]
    );

    if (response) {
      await login(req, res);
    }
  } catch {
    return res.status(500).send("Email is already in use.");
  }
}

async function logout(req, res) {
  res.send("logged out");
}

module.exports = { authenticate, login, logout, register };
