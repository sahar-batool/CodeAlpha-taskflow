import express from "express";
import { body, param } from "express-validator";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  createProject, getMyProjects, getProject, updateProject,
  deleteProject, addMember, removeMember,
} from "../controllers/projectController.js";
import { getBoard, createColumn } from "../controllers/boardController.js";
import { createTask } from "../controllers/taskController.js";

const router = express.Router();
router.use(protect);

const projectId = param("projectId").isMongoId().withMessage("Invalid project ID");

router
  .route("/")
  .get(getMyProjects)
  .post(
    [
      body("name").isString().withMessage("Name is required").trim()
        .isLength({ min: 2, max: 80 }).withMessage("Name must be 2 to 80 characters"),
      body("description").optional().isString().trim()
        .isLength({ max: 500 }).withMessage("Description must be at most 500 characters"),
    ],
    validate,
    createProject
  );

router
  .route("/:projectId")
  .get([projectId], validate, getProject)
  .patch(
    [
      projectId,
      body("name").optional().isString().trim()
        .isLength({ min: 2, max: 80 }).withMessage("Name must be 2 to 80 characters"),
      body("description").optional().isString().trim()
        .isLength({ max: 500 }).withMessage("Description must be at most 500 characters"),
    ],
    validate,
    updateProject
  )
  .delete([projectId], validate, deleteProject);

router.post(
  "/:projectId/members",
  [
    projectId,
    body("email").isString().withMessage("Email is required").trim()
      .isEmail().withMessage("Enter a valid email")
      .normalizeEmail({ gmail_remove_dots: false }),
  ],
  validate,
  addMember
);

router.delete(
  "/:projectId/members/:userId",
  [projectId, param("userId").isMongoId().withMessage("Invalid user ID")],
  validate,
  removeMember
);

router.get("/:projectId/board", [projectId], validate, getBoard);

router.post(
  "/:projectId/columns",
  [
    projectId,
    body("title").isString().withMessage("Title is required").trim()
      .isLength({ min: 1, max: 50 }).withMessage("Title must be 1 to 50 characters"),
  ],
  validate,
  createColumn
);

router.post(
  "/:projectId/tasks",
  [
    projectId,
    body("column").isMongoId().withMessage("Valid column ID is required"),
    body("title").isString().withMessage("Title is required").trim()
      .isLength({ min: 1, max: 120 }).withMessage("Title must be 1 to 120 characters"),
    body("description").optional().isString().trim()
      .isLength({ max: 2000 }).withMessage("Description must be at most 2000 characters"),
    body("priority").optional().isIn(["low", "medium", "high"]).withMessage("Invalid priority"),
    body("dueDate").optional({ nullable: true }).isISO8601().withMessage("Invalid due date"),
    body("assignee").optional({ nullable: true }).isMongoId().withMessage("Invalid assignee ID"),
  ],
  validate,
  createTask
);

export default router;