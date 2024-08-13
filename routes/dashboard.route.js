const { getDashboardData } = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.get("/", getDashboardData);

module.exports = router;
