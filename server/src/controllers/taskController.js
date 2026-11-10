import Task from "../models/Task.js";
import Column from "../models/Column.js";
import Comment from "../models/Comment.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getProjectForMember, getTaskForMember } from "../utils/access.js";

const assertAssignee = (project, assigneeId) => {
  if (!assigneeId) return;
  if (!project.members.some((m) => m.user.equals(assigneeId))) {
    throw new AppError("Assignee must be a project member", 400);
  }
};

export const createTask = asyncHandler(async (req, res) => {
  const { project } = await getProjectForMember(req.params.projectId, req.user._id);
  const { column: columnId, title, description, priority, dueDate, assignee } = req.body;

  const column = await Column.findOne({ _id: columnId, project: project._id });
  if (!column) throw new AppError("Column not found in this project", 404);
  assertAssignee(project, assignee);

  const order = await Task.countDocuments({ column: column._id });
  const task = await Task.create({
    project: project._id,
    column: column._id,
    title,
    description,
    priority,
    dueDate,
    assignee: assignee || null,
    order,
    createdBy: req.user._id,
  });
  await task.populate("assignee", "name email");

  res.status(201).json({ success: true, task });
});

export const getTask = asyncHandler(async (req, res) => {
  const { task } = await getTaskForMember(req.params.id, req.user._id);
  await task.populate("assignee", "name email");
  res.json({ success: true, task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { task, project } = await getTaskForMember(req.params.id, req.user._id);

  if (req.body.assignee !== undefined) assertAssignee(project, req.body.assignee);

  const allowed = ["title", "description", "priority", "dueDate", "assignee"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) task[key] = req.body[key];
  });

  await task.save();
  await task.populate("assignee", "name email");

  res.json({ success: true, task });
});

export const moveTask = asyncHandler(async (req, res) => {
  const { task } = await getTaskForMember(req.params.id, req.user._id);

  const destColumn = await Column.findOne({ _id: req.body.column, project: task.project });
  if (!destColumn) throw new AppError("Column not found in this project", 404);

  const sourceColumnId = task.column;

  const destTasks = await Task.find({ column: destColumn._id, _id: { $ne: task._id } })
    .sort("order")
    .select("_id");
  const ids = destTasks.map((t) => t._id);
  const position = Math.min(Math.max(Number(req.body.position) || 0, 0), ids.length);
  ids.splice(position, 0, task._id);

  await Task.bulkWrite(
    ids.map((id, index) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: index, column: destColumn._id } } },
    }))
  );

  if (!sourceColumnId.equals(destColumn._id)) {
    const rest = await Task.find({ column: sourceColumnId }).sort("order").select("_id");
    if (rest.length) {
      await Task.bulkWrite(
        rest.map((t, index) => ({
          updateOne: { filter: { _id: t._id }, update: { $set: { order: index } } },
        }))
      );
    }
  }

  const updated = await Task.findById(task._id).populate("assignee", "name email");
  res.json({ success: true, task: updated });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const { task, role } = await getTaskForMember(req.params.id, req.user._id);

  if (role !== "owner" && !task.createdBy.equals(req.user._id)) {
    throw new AppError("Only the task creator or project owner can delete this task", 403);
  }

  await Comment.deleteMany({ task: task._id });
  await task.deleteOne();

  res.json({ success: true, message: "Task deleted" });
});