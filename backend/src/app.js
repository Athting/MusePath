import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth.js'
import apiRouter from './routes/api.js'

const app = express()
const frontendUrl = process.env.FRONTEND_URL

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: frontendUrl,
    credentials: true
}))

app.use('/api/auth', authRouter)
app.use('/api', apiRouter)

export default app
