import jwt from 'jsonwebtoken'
import { BlacklistToken } from '../models/BlacklistToken.js'

export const AUTH_COOKIE_NAME = 'token'
const JWT_SECRET = process.env.JWT_SECRET
const isProduction = process.env.NODE_ENV === 'production'

export const authCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
}

export function createToken(user) {
    const payload = {
        id: user._id.toString(),
        email: user.email,
        username: user.username || ''
    }

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' })
}

export async function requireAuth(req, res, next) {
    const token = req.cookies?.[AUTH_COOKIE_NAME]

    if (!token) {
        return res.status(401).json({ 
            error: 'Authentication required. Token missing.' 
        })
    }

    try {
        const isBlacklisted = await BlacklistToken.exists({ token })
        if (isBlacklisted) {
            return res.status(401).json({ 
                error: 'Session expired or logged out.' 
            })
        }

        const decodedPayload = jwt.verify(token, JWT_SECRET)
        req.user = decodedPayload
        return next()
    } 
    catch {
        return res.status(401).json({ 
            error: 'Invalid or expired token.' 
        })
    }
}
