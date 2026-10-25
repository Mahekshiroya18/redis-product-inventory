
const { createClient } = require("redis");

let redisClient;

async function connectRedis() {
    redisClient = createClient({
        username: "default",
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT)
        }
    });

    redisClient.on("error", (err) => {
        console.error("Redis Client Error:", err.message);
    });

    await redisClient.connect();
    console.log("Connected to Redis Cloud successfully");

    return redisClient;
}

function getRedisClient() {
    if (!redisClient || !redisClient.isOpen) {
        throw new Error("Redis is not connected");
    }

    return redisClient;
}

async function disconnectRedis() {
    if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        console.log("Redis connection closed");
    }
}

module.exports = {
    connectRedis,
    getRedisClient,
    disconnectRedis
};
