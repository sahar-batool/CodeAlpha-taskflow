import Notification from "../models/Notification.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id }).sort("-createdAt").limit(30),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ success: true, notifications, unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true });
  res.json({ success: true });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});