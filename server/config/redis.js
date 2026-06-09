const { createClient } = require("redis");
const AppError = require("../utils/appError");

let redisClient;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (error) => {
      console.error("Redis error:", error.message);
    });
  }

  return redisClient;
};

const connectRedis = async () => {
  const client = getRedisClient();

  if (!client.isOpen) {
    await client.connect();
    console.log("Redis Connected");
  }

  return client;
};

const ensureRedisReady = () => {
  const client = getRedisClient();

  if (!client.isOpen) {
    throw new AppError("Redis is not connected", 503);
  }

  return client;
};

const disconnectRedis = async () => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
};

module.exports = {
  connectRedis,
  disconnectRedis,
  ensureRedisReady,
  getRedisClient,
};
