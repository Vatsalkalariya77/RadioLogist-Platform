const AppError = require("../utils/appError");
const { normalizeEmail } = require("../utils/auth");

const WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const MAX_ATTEMPTS = Number(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS || 5);
const attempts = new Map();

const assertRateLimitConfig = () => {
  if (!Number.isInteger(WINDOW_MS) || WINDOW_MS <= 0) {
    throw new Error("AUTH_RATE_LIMIT_WINDOW_MS must be a positive integer");
  }

  if (!Number.isInteger(MAX_ATTEMPTS) || MAX_ATTEMPTS <= 0) {
    throw new Error("AUTH_RATE_LIMIT_MAX_ATTEMPTS must be a positive integer");
  }
};

assertRateLimitConfig();

const getClientKey = (req) => {
  const ip =
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "unknown";
  const email = normalizeEmail(req.body?.email);

  return email ? `${ip}:${email}` : ip;
};

const clearExpiredAttempts = (now) => {
  for (const [key, value] of attempts.entries()) {
    if (value.expiresAt <= now) {
      attempts.delete(key);
    }
  }
};

const createAuthRateLimit = ({
  action = "authentication attempt",
  failOnStatusCodes = [401],
} = {}) => {
  const normalizedFailCodes = new Set(failOnStatusCodes);

  return (req, res, next) => {
    const now = Date.now();
    clearExpiredAttempts(now);

    const key = `${req.path}:${getClientKey(req)}`;
    const current = attempts.get(key);
    const remaining = current && current.expiresAt > now
      ? Math.max(MAX_ATTEMPTS - current.count, 0)
      : MAX_ATTEMPTS;

    res.set("X-RateLimit-Limit", MAX_ATTEMPTS.toString());
    res.set("X-RateLimit-Remaining", remaining.toString());

    if (current && current.count >= MAX_ATTEMPTS && current.expiresAt > now) {
      const retryAfterSeconds = Math.ceil((current.expiresAt - now) / 1000);

      res.set("Retry-After", retryAfterSeconds.toString());
      res.set("X-RateLimit-Reset", new Date(current.expiresAt).toISOString());

      return next(
        new AppError(
          `Too many ${action}. Please try again later.`,
          429
        )
      );
    }

    res.on("finish", () => {
      const finishedAt = Date.now();
      const existing = attempts.get(key);
      const hasFailed = normalizedFailCodes.has(res.statusCode);

      if (hasFailed) {
        if (existing && existing.expiresAt > finishedAt) {
          existing.count += 1;
          return;
        }

        attempts.set(key, {
          count: 1,
          expiresAt: finishedAt + WINDOW_MS,
        });
        return;
      }

      if (res.statusCode < 400) {
        attempts.delete(key);
      }
    });

    next();
  };
};

module.exports = createAuthRateLimit;
