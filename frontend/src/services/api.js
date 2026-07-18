const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://musepath-1.onrender.com/api";

async function request(path, options = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}${path}`, {
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

    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            data.error ||
                data.message ||
                `Server error (${res.status})`
        );
    }

    return data;
}

export const api = {
    generatePlan: (payload) =>
        request('/generate-plan', { method: 'POST', body: JSON.stringify(payload) }),

    getDashboard: (userId) =>
        request(`/dashboard?userId=${userId}`),

    getDiscover: (params) => {
        const q = new URLSearchParams(params).toString()
        return request(`/discover?${q}`)
    },

    getVideos: (params) => {
        const q = new URLSearchParams(params).toString()
        return request(`/videos?${q}`)
    },

    logProgress: (payload) =>
        request('/progress', { method: 'POST', body: JSON.stringify(payload) }),

    getProgress: (userId) =>
        request(`/progress?userId=${userId}`),

    saveSong: (payload) =>
        request('/save-song', { method: 'POST', body: JSON.stringify(payload) }),

    removeSong: (payload) =>
        request('/save-song', { method: 'DELETE', body: JSON.stringify(payload) }),

    getProfile: (userId) =>
        request(`/profile?userId=${userId}`),

    updateProfile: (payload) =>
        request('/profile', { method: 'PATCH', body: JSON.stringify(payload) }),

    getPlans: (userId) =>
        request(`/plans?userId=${userId}`),

    setActivePlan: (payload) =>
        request('/plans/active', { method: 'POST', body: JSON.stringify(payload) }),
}
