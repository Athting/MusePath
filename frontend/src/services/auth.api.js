const API_URL = import.meta.env.VITE_API_URL;

async function authRequest(path, options = {}) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? {
                      Authorization: `Bearer ${token}`
                  }
                : {}),
            ...options.headers
        },
        ...options
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
    }

    return data;
}

export async function login(body) {
    const data = await authRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify(body)
    });

    localStorage.setItem("token", data.token);

    return data;
}

export async function register(body) {
    const data = await authRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify(body)
    });

    localStorage.setItem("token", data.token);

    return data;
}

export function logout() {
    localStorage.removeItem("token");

    return authRequest("/auth/logout", {
        method: "POST"
    });
}

export function getMe() {
    return authRequest("/auth/me");
}