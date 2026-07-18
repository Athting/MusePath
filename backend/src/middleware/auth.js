import jwt from "jsonwebtoken";
import { BlacklistToken } from "../models/BlacklistToken.js";

export const AUTH_COOKIE_NAME = "token";
const JWT_SECRET = process.env.JWT_SECRET;

export const authCookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/"
};

export function createToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
            username: user.username || ""
        },
        JWT_SECRET,
        { expiresIn: "30d" }
    );
}

export async function requireAuth(req, res, next) {
    let token = null;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
    }

    if (!token) {
        token = req.cookies?.[AUTH_COOKIE_NAME];
    }

    if (!token) {
        return res.status(401).json({
            error: "Authentication required. Token missing."
        });
    }

    try {
        const isBlacklisted = await BlacklistToken.exists({ token });

        if (isBlacklisted) {
            return res.status(401).json({
                error: "Session expired or logged out."
            });
        }

        req.user = jwt.verify(token, JWT_SECRET);

        next();
    } catch {
        return res.status(401).json({
            error: "Invalid or expired token."
        });
    }
}