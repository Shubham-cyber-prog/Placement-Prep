import dotenv from "dotenv";
import app from "./server.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
    try {
        console.log("🔧 Attempting DB connection...");
        await connectDB();
        console.log("✅ DB connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error("Startup error:", err);
        process.exit(1);
    }
};

start();
