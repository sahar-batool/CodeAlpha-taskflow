let io = null;

export const setIO = (instance) => {
  io = instance;
};

export const getIO = () => io;

// Tell everyone in a project's room, except the person who made the change
export const emitToProject = (req, projectId, event, payload) => {
  if (!io) return;
  let room = io.to(`project:${projectId}`);
  const socketId = req.headers["x-socket-id"];
  if (socketId) room = room.except(socketId);
  room.emit(event, payload);
};

// Used when a member is removed: stop sending them this project's events
export const removeUserFromProject = (userId, projectId) => {
  if (!io) return;
  io.to(`user:${userId}`).emit("member:removed", { projectId: String(projectId) });
  io.in(`user:${userId}`).socketsLeave(`project:${projectId}`);
};

// Used when a project is deleted
export const closeProjectRoom = (projectId) => {
  if (!io) return;
  io.in(`project:${projectId}`).socketsLeave(`project:${projectId}`);
}


// Tell one user's open dashboards to reload their project list
export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};
