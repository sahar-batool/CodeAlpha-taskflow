import Project from "../models/Project.js";
import Task from "../models/Task.js";
import AppError from "./AppError.js";

export const getProjectForMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) throw new AppError("Project not found", 404);

  const member = project.members.find((m) => m.user.equals(userId));
  if (!member) throw new AppError("Project not found", 404);

  return { project, role: member.role };
};

export const getTaskForMember = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) throw new AppError("Task not found", 404);

  const access = await getProjectForMember(task.project, userId);
  return { task, ...access };
};

export const requireOwner = (role) => {
  if (role !== "owner") throw new AppError("Only the project owner can do this", 403);
};