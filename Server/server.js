import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDb from "./config/mongoConnect.js";
import authRouter from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// DB connect
connectDb();

// CORS setup (include deployed frontend URL later)
const allowedOrigins = [
  "http://localhost:5173", 
  "https://your-frontend.vercel.app"
];

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
  res.send("API is working 🚀");
});


export default app;
