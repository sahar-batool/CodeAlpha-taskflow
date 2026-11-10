import express from "express";
import { param } from "express-validator";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { deleteComment } from "../controllers/commentController.js";

const router = express.Router();
router.use(protect);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid comment ID")],
  validate,
  deleteComment
);

export default router;