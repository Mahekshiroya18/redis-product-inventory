
const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB Atlas");
        console.log("Database:", mongoose.connection.name);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
}

async function disconnectDB() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("MongoDB connection closed");
    }
}

module.exports = { connectDB, disconnectDB };
