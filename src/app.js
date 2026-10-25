
require("dotenv").config();

const { connectDB, disconnectDB } = require("./config/database");
const { connectRedis, disconnectRedis } = require("./config/redis");
const { runProductOperations } = require("./services/product_service");

async function main() {
    try {
        console.log("Starting Product Inventory Management...\n");

        // Connect to MongoDB
        await connectDB();

        // Connect to Redis
        await connectRedis();

        // Run all product operations
        await runProductOperations();

        console.log("\nAll product operations completed successfully.");
    } catch (error) {
        console.error("\nApplication error:", error.message);
    } finally {
        await disconnectRedis();
        await disconnectDB();
    }
}

main();
