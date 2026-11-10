import express from "express";
import { body, param } from "express-validator";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { updateColumn, deleteColumn } from "../controllers/boardController.js";

const router = express.Router();
router.use(protect);

const id = param("id").isMongoId().withMessage("Invalid column ID");

router
  .route("/:id")
  .patch(
    [
      id,
      body("title").isString().withMessage("Title is required").trim()
        .isLength({ min: 1, max: 50 }).withMessage("Title must be 1 to 50 characters"),
    ],
    validate,
    updateColumn
  )
  .delete([id], validate, deleteColumn);

export default router;