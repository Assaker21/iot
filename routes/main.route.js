const {
  getDashboardData,
  getPrediction,
} = require("../controllers/main.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.get("/dashboard", authMiddleware, getDashboardData);

router.post("/prediction", authMiddleware, getPrediction);

module.exports = router;
