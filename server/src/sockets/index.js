import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";
import Project from "../models/Project.js";
import { setIO } from "../utils/realtime.js";

const getCookie = (header = "", name) => {
  const pair = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
};

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, credentials: true },
    maxHttpBufferSize: 1e4,
  });
  setIO(io);

  // Reject anyone who isn't logged in
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || getCookie(socket.handshake.headers.cookie, "token");
      if (!token) throw new Error("No token");
      const { id } = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(id).select("_id");
      if (!user) throw new Error("No user");
      socket.userId = user._id.toString();
      next();
    } catch (err) {
      next(new Error("Not authenticated"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on("project:join", async (projectId, ack) => {
      try {
        if (typeof projectId !== "string" || !mongoose.isValidObjectId(projectId)) {
          return ack?.({ ok: false });
        }
        const isMember = await Project.exists({ _id: projectId, "members.user": socket.userId });
        if (!isMember) return ack?.({ ok: false });
        socket.join(`project:${projectId}`);
         
        ack?.({ ok: true });
      } catch {
        ack?.({ ok: false });
      }
    });

    socket.on("project:leave", (projectId) => {
      if (typeof projectId === "string") socket.leave(`project:${projectId}`);
    });
  });

  return io;
};