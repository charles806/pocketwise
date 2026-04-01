import { Router } from "express"
import { signUp, login, refresh, logout, me } from "../controller/auth.controller.js"
import { validate } from "../middleware/validate.middleware.js"
import { authMiddleware } from "../middleware/auth.middleware.js"
import { signupSchema, loginSchema } from "../schemas/auth.schema.js"

const router = Router()

router.post("/signup", validate(signupSchema), signUp)
router.post("/login", validate(loginSchema), login)
router.post("/refresh", refresh)
router.post("/logout", logout)
router.get("/me", authMiddleware, me)

export default router