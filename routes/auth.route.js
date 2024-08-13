const {
  authenticate,
  login,
  register,
  logout,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.get("/", authMiddleware, authenticate);
router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);

module.exports = router;
