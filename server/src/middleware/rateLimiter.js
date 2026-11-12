import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV === "development";

const make = ({ windowMs, max, message, ...rest }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ success: false, message }),
    ...rest,
  });

// Tier 1: everything else (boards, tasks, comments, notifications). Generous.
export const apiLimiter = make({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 1500,
  message: "Too many requests, please try again later",
});

// Tier 2: login. Strict, and only FAILED attempts count.
export const loginLimiter = make({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: "Too many failed login attempts, please try again in 15 minutes",
});

// Tier 3: register and future password reset. Very strict.
export const strictLimiter = make({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many attempts, please try again in an hour",
});