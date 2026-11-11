import express from "express";
import { param } from "express-validator";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { getNotifications, markRead, markAllRead } from "../controllers/notificationController.js";

const router = express.Router();
router.use(protect);

router.get("/", getNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", [param("id").isMongoId().withMessage("Invalid ID")], validate, markRead);

export default router;