import Notification from "../models/Notification.js";
import { getIO } from "./realtime.js";

export const notify = async ({ users, actor, type, message, project, task = null }) => {
  try {
    const ids = [...new Set(users.map(String))].filter((id) => id !== String(actor));
    if (!ids.length) return;

    const docs = await Notification.insertMany(
      ids.map((user) => ({ user, type, message, project, task }))
    );
    const io = getIO();
    docs.forEach((doc) => io?.to(`user:${doc.user}`).emit("notification:new", doc));
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};