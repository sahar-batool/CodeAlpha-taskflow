import Comment from "../models/Comment.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getProjectForMember, getTaskForMember } from "../utils/access.js";

export const getComments = asyncHandler(async (req, res) => {
  const { task } = await getTaskForMember(req.params.id, req.user._id);
  const comments = await Comment.find({ task: task._id })
    .sort("createdAt")
    .populate("author", "name email");
  res.json({ success: true, comments });
});

export const addComment = asyncHandler(async (req, res) => {
  const { task } = await getTaskForMember(req.params.id, req.user._id);

  const comment = await Comment.create({
    task: task._id,
    project: task.project,
    author: req.user._id,
    text: req.body.text,
  });
  await comment.populate("author", "name email");

  res.status(201).json({ success: true, comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new AppError("Comment not found", 404);

  const { role } = await getProjectForMember(comment.project, req.user._id);
  if (role !== "owner" && !comment.author.equals(req.user._id)) {
    throw new AppError("You can only delete your own comments", 403);
  }

  await comment.deleteOne();
  res.json({ success: true, message: "Comment deleted" });
});