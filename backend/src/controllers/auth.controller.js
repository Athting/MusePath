import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { BlacklistToken } from '../models/BlacklistToken.js'
import { AUTH_COOKIE_NAME, authCookieOptions, createToken } from '../middleware/auth.js'
import { sendServerError } from './controller.helpers.js'

function toClientUser(user) {
    return {
        id: user._id.toString(),
        email: user.email,
        user_metadata: { username: user.username || '' },
        username: user.username || ''
    }
}

export async function signupController(req, res) {
    try {
        const { email, password, username } = req.body || {}
        if (!email || !password) return res.status(400).json({ error: 'email and password required' })

        const existing = await User.findOne({ email: email.toLowerCase() })
        if (existing) return res.status(409).json({ error: 'Email already registered' })

        const passwordHash = await bcrypt.hash(password, 10)
        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash,
            username: username || email.split('@')[0]
        })

        const token = createToken(user)
        res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions)
        return res.status(201).json({
            token,
            user: toClientUser(user)
        })
    } catch (error) {
        return sendServerError(res, 'Error in signupController', 'Failed to sign up', error)
    }
}

export async function loginController(req, res) {
    try {
        const { email, password } = req.body || {}
        if (!email || !password) return res.status(400).json({ error: 'email and password required' })

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) return res.status(401).json({ error: 'Invalid credentials' })

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

        const token = createToken(user)
        res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions)
        return res.status(200).json({
            token,
            user: toClientUser(user)
        })
    } catch (error) {
        return sendServerError(res, 'Error in loginController', 'Failed to login', error)
    }
}

export async function getMeController(req, res) {
    try {
        const user = await User.findById(req.user.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        return res.status(200).json({ user: toClientUser(user) })
    } catch (error) {
        return sendServerError(res, 'Error in getMeController', 'Failed to load user', error)
    }
}

export async function logoutController(req, res) {
    const authHeader = req.headers.authorization;

    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : req.cookies?.[AUTH_COOKIE_NAME];

    if (token) {
        await BlacklistToken.create({ token })
    }

    res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions)
    return res.status(200).json({ success: true })
}
