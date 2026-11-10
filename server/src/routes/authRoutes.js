import express from "express";
import { body } from "express-validator";
import { register, login, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import validate from "../middleware/validate.js";

const router = express.Router();

const emailRule = body("email")
  .isString().withMessage("Email is required")
  .trim()
  .isEmail().withMessage("Enter a valid email")
  .normalizeEmail({ gmail_remove_dots: false });

router.post(
  "/register",
  authLimiter,
  [
    body("name")
      .isString().withMessage("Name is required")
      .trim()
      .isLength({ min: 2, max: 50 }).withMessage("Name must be 2 to 50 characters"),
    emailRule,
    body("password")
      .isString().withMessage("Password is required")
      .isLength({ min: 8, max: 72 }).withMessage("Password must be 8 to 72 characters")
      .matches(/[A-Za-z]/).withMessage("Password needs at least one letter")
      .matches(/\d/).withMessage("Password needs at least one number"),
  ],
  validate,
  register
);

router.post(
  "/login",
  authLimiter,
  [emailRule, body("password").isString().notEmpty().withMessage("Password is required")],
  validate,
  login
);

router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;