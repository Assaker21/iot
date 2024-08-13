const {
  findMany,
  update,
  create,
} = require("../controllers/device.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = require("express").Router();

router.get("/", authMiddleware, findMany);
router.put("/:id", authMiddleware, update);
router.post("/", authMiddleware, create);

module.exports = router;
