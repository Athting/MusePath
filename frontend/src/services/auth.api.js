const API_URL = 'https://musepath-1.onrender.com/api'

async function authRequest(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Authentication request failed')
    return data
}

export const register = ({ username, email, password }) =>
    authRequest('/auth/signup', { method: 'POST', body: JSON.stringify({ username, email, password }) })

export const login = ({ email, password }) =>
    authRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

export const logout = () => authRequest('/auth/logout', { method: 'POST' })

export const getMe = () => authRequest('/auth/me')
