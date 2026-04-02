import axios from "axios";

const apiURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: apiURL.replace(/\/+$/, "") + (apiURL.includes("/api") ? "" : "/api"),
    timeout: 20000,
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
