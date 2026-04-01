import express, { type Request, type Response } from "express"
import dotenv from "dotenv"
import cors from "cors"
import { sendSuccess, sendError } from "./utils/response.js"
import { errorMiddleware } from "./middleware/error.middleware.js"
import authRouter from "./routes/auth.routes.js"


dotenv.config()
const PORT = process.env.PORT || 3000
const FRONTEND_URL = process.env.FRONTEND_URL

const app = express()
app.use(express.json())
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}))

app.get('/api/v1', (req: Request, res: Response) => {
    try {
        sendSuccess(res, "Welcome to PocketWise API")
    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal Server Error"
        sendError(res, message)
    }
})

app.get('/api/v1/health', (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "PocketWise API is running" })
})

//Auth
app.use("/api/v1/auth", authRouter)




app.use(errorMiddleware)

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`)
})
