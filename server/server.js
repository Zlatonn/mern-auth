import express from "express"
import cors from "cors"
import "dotenv/config"
import cookieParser from "cookie-parser"

import connectDB from "./config/mongodb.js"
import authRouter from "./routes/authRoutes.js"
import userRouter from "./routes/userRoutes.js"

// Create  express app
const app = express()
const port = process.env.PORT || 4000

connectDB()

const allowedOrigins = ["http://localhost:5173"]

app.use(cookieParser())
app.use(cors({ origin: allowedOrigins, credentials: true })) //Allow sending header(cookie) from browser
app.use(express.json()) // All request will be passed using JSON

// API Endpoint
app.get("/", (req, res) => res.send("API Running..."))

app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)

app.listen(port, () => console.log(`Server started on PORT:${port}`))
