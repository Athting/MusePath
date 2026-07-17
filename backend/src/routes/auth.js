import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getMeController, loginController, logoutController, signupController } from '../controllers/auth.controller.js'

const authRouter = express.Router()

authRouter.post('/signup', signupController)
authRouter.post('/login', loginController)
authRouter.post('/logout', logoutController)
authRouter.get('/me', requireAuth, getMeController)

export default authRouter
