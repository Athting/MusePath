export function sameUser(req, userId) {
    return req.user?.id === userId
}

export function withId(document) {
    if (!document) return document
    return { ...document, id: String(document.id || document._id) }
}

export function sendServerError(res, logLabel, publicMessage, error) {
    console.error(`${logLabel}:`, error)
    return res.status(500).json({ error: publicMessage, message: error.message })
}
