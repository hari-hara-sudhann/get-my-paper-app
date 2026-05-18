import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("Missing REDIS_URL environment variable.");
}

const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: false,
  },
});

redis.on("error", (err) => {
  console.error("Redis client error:", err);
});

export const connectRedis = async (): Promise<void> => {
  if (redis.isOpen) {
    return;
  }

  console.log("Connecting to Redis...");
  await redis.connect();
  console.log("Redis connected.");
};

export default redis;
