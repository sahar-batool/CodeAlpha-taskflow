import express from "express";
import { body, param } from "express-validator";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  getTask, updateTask, moveTask, deleteTask,
} from "../controllers/taskController.js";
import { getComments, addComment } from "../controllers/commentController.js";

const router = express.Router();
router.use(protect);

const id = param("id").isMongoId().withMessage("Invalid task ID");

router
  .route("/:id")
  .get([id], validate, getTask)
  .patch(
    [
      id,
      body("title").optional().isString().trim()
        .isLength({ min: 1, max: 120 }).withMessage("Title must be 1 to 120 characters"),
      body("description").optional().isString().trim()
        .isLength({ max: 2000 }).withMessage("Description must be at most 2000 characters"),
      body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
      body("dueDate").optional({ nullable: true }).isISO8601().withMessage("Invalid due date"),
      body("assignee").optional({ nullable: true }).isMongoId().withMessage("Invalid assignee ID"),
    ],
    validate,
    updateTask
  )
  .delete([id], validate, deleteTask);

router.patch(
  "/:id/move",
  [
    id,
    body("column").isMongoId().withMessage("Valid column ID is required"),
    body("position").isInt({ min: 0 }).withMessage("Position must be 0 or higher"),
  ],
  validate,
  moveTask
);

router
  .route("/:id/comments")
  .get([id], validate, getComments)
  .post(
    [
      id,
      body("text").isString().withMessage("Comment text is required").trim()
        .isLength({ min: 1, max: 1000 }).withMessage("Comment must be 1 to 1000 characters"),
    ],
    validate,
    addComment
  );

export default router;