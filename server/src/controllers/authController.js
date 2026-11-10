import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendTokenCookie, clearTokenCookie } from "../utils/token.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new AppError("Email already registered", 409);

  const user = await User.create({ name, email, password });
  sendTokenCookie(res, user._id);

  res.status(201).json({ success: true, user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  sendTokenCookie(res, user._id);
  res.json({ success: true, user: publicUser(user) });
});

export const logout = (req, res) => {
  clearTokenCookie(res);
  res.json({ success: true, message: "Logged out" });
};

export const getMe = (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
};