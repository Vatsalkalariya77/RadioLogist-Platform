const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new AppError("MONGO_URI is not configured", 500);
  }

  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

module.exports = connectDB;
