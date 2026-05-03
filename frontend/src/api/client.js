import axios from "axios";

const client = axios.create({
  baseURL: window.location.hostname === "localhost" && window.location.port === "5173"
    ? "http://localhost:8000/api/v1"
    : "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("ims_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ims_token");
      localStorage.removeItem("ims_username");
      window.location.href = "/login";
    }
    if (error.response?.status === 400) {
      return Promise.reject(error);
    }
    console.error("Unexpected API error:", error);
    return Promise.reject(error);
  }
);

export default client;