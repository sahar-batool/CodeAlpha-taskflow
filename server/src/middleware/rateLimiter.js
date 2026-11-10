import rateLimit from "express-rate-limit";

const handler = (message) => (req, res) =>
  res.status(429).json({ success: false, message });

// General limiter for all API routes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many requests, please try again later"),
});

// Stricter limiter for login/register (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: handler("Too many attempts, please try again in 15 minutes"),
});