import Project from "../models/Project.js";
import Column from "../models/Column.js";
import Task from "../models/Task.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getProjectForMember, requireOwner } from "../utils/access.js";
import { emitToProject, emitToUser, removeUserFromProject, closeProjectRoom } from "../utils/realtime.js";
import { notify } from "../utils/notify.js";

export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: [{ user: req.user._id, role: "owner" }],
  });

  await Column.insertMany(
    ["To Do", "In Progress", "Done"].map((title, i) => ({
      project: project._id,
      title,
      order: i,
    }))
  );

  res.status(201).json({ success: true, project });
});

export const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ "members.user": req.user._id })
    .populate("members.user", "name email")
    .sort("-updatedAt");
  res.json({ success: true, projects });
});

export const getProject = asyncHandler(async (req, res) => {
  const { project, role } = await getProjectForMember(req.params.projectId, req.user._id);
  await project.populate("members.user", "name email");
  res.json({ success: true, project, role });
});

export const updateProject = asyncHandler(async (req, res) => {
  const { project, role } = await getProjectForMember(req.params.projectId, req.user._id);
  requireOwner(role);

  if (req.body.name !== undefined) project.name = req.body.name;
  if (req.body.description !== undefined) project.description = req.body.description;
  await project.save();

  res.json({ success: true, project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const { project, role } = await getProjectForMember(req.params.projectId, req.user._id);
  requireOwner(role);
    const memberIds = project.members.map((m) => m.user.toString());

  await Comment.deleteMany({ project: project._id });
  await Task.deleteMany({ project: project._id });
  await Column.deleteMany({ project: project._id });
  await project.deleteOne();
    emitToProject(req, project._id, "project:deleted");
  closeProjectRoom(project._id);
    memberIds.forEach((id) => emitToUser(id, "projects:changed"));

  res.json({ success: true, message: "Project deleted" });
});

export const addMember = asyncHandler(async (req, res) => {
  const { project, role } = await getProjectForMember(req.params.projectId, req.user._id);
  requireOwner(role);

  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new AppError("No user found with that email", 404);
  if (project.members.some((m) => m.user.equals(user._id))) {
    throw new AppError("User is already a member", 409);
  }

  project.members.push({ user: user._id, role: "member" });
  await project.save();
  await project.populate("members.user", "name email");
    emitToProject(req, project._id, "board:refresh");
  await notify({
    users: [user._id],
    actor: req.user._id,
    type: "member_added",
    message: `${req.user.name} added you to "${project.name}"`,
    project: project._id,
  });
    emitToUser(user._id, "projects:changed");
    

  res.status(201).json({ success: true, project });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { project, role } = await getProjectForMember(req.params.projectId, req.user._id);
  const targetId = req.params.userId;

  const isSelf = req.user._id.equals(targetId);
  if (!isSelf) requireOwner(role);
  if (project.owner.equals(targetId)) {
    throw new AppError("The project owner cannot be removed", 400);
  }

  const before = project.members.length;
  project.members = project.members.filter((m) => !m.user.equals(targetId));
  if (project.members.length === before) throw new AppError("Member not found", 404);

  await project.save();
  await Task.updateMany(
    { project: project._id, assignee: targetId },
    { $set: { assignee: null } }
  );
    emitToProject(req, project._id, "board:refresh");
  removeUserFromProject(targetId, project._id);
      emitToUser(targetId, "projects:changed");

  res.json({ success: true, message: "Member removed" });
});