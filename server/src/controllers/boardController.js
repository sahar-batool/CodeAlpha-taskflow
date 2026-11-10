import Column from "../models/Column.js";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getProjectForMember, requireOwner } from "../utils/access.js";

const MAX_COLUMNS = 12;

export const getBoard = asyncHandler(async (req, res) => {
  const { project } = await getProjectForMember(req.params.projectId, req.user._id);

  const [columns, tasks] = await Promise.all([
    Column.find({ project: project._id }).sort("order"),
    Task.find({ project: project._id }).sort("order").populate("assignee", "name email"),
  ]);

  res.json({ success: true, columns, tasks });
});

export const createColumn = asyncHandler(async (req, res) => {
  const { project } = await getProjectForMember(req.params.projectId, req.user._id);

  const count = await Column.countDocuments({ project: project._id });
  if (count >= MAX_COLUMNS) throw new AppError(`A board can have at most ${MAX_COLUMNS} columns`, 400);

  const column = await Column.create({
    project: project._id,
    title: req.body.title,
    order: count,
  });

  res.status(201).json({ success: true, column });
});

export const updateColumn = asyncHandler(async (req, res) => {
  const column = await Column.findById(req.params.id);
  if (!column) throw new AppError("Column not found", 404);
  await getProjectForMember(column.project, req.user._id);

  column.title = req.body.title;
  await column.save();

  res.json({ success: true, column });
});

export const deleteColumn = asyncHandler(async (req, res) => {
  const column = await Column.findById(req.params.id);
  if (!column) throw new AppError("Column not found", 404);
  const { role } = await getProjectForMember(column.project, req.user._id);
  requireOwner(role);

  const taskIds = await Task.find({ column: column._id }).distinct("_id");
  await Comment.deleteMany({ task: { $in: taskIds } });
  await Task.deleteMany({ column: column._id });
  await column.deleteOne();

  res.json({ success: true, message: "Column deleted" });
});