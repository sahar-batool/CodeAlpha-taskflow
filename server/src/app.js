import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import columnRoutes from "./routes/columnRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

import sanitize from "./middleware/sanitize.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Needed on Render/Railway/Vercel so rate limiting sees the real client IP
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(sanitize);
app.use(hpp());

app.use("/api", apiLimiter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "TaskFlow API is running" });
});

// Routes will be added here in the next phases
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/columns", columnRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;