
import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

// environment variables 
dotenv.config({
    path: "./.env"
});

const PORT = process.env.PORT || 3000;

// connect to the database
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err)
        process.exit(1);
    });
