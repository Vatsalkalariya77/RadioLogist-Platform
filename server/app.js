const express = require("express");
const cors = require("cors");
const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/user/user.routes");
const caseRoutes = require("./modules/case/case.routes");
const submissionRoutes = require("./modules/submission/submission.routes");
const {
  notFound,
  errorHandler,
} = require("./middlewares/error.middleware");

const app = express();

// Middlewares
app.disable("x-powered-by");

if (process.env.TRUST_PROXY_HOPS) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
}

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : [];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS policy does not allow this origin"));
    },
  })
);
app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/submissions", submissionRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
