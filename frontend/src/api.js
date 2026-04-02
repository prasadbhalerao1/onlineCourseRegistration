import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Response interceptor — surface the backend message cleanly
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const message =
            err.response?.data?.message ||
            err.message ||
            "An unexpected error occurred";
        err.displayMessage = message;
        return Promise.reject(err);
    },
);

export default api;
