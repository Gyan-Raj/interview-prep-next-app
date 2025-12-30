
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let pendingRequests: Array<(value?: unknown) => void> = [];

function onRefreshed() {
  pendingRequests.forEach((resolve) => resolve());
  pendingRequests = [];
}

// 🔁 Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If refresh already in progress, wait
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push(() => resolve(api(originalRequest)));
        });
      }

      isRefreshing = true;

      try {
        await api.post("/refresh"); // 🍪 silent cookie update
        isRefreshing = false;
        onRefreshed();
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        pendingRequests = [];
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
