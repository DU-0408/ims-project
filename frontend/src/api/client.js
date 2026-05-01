import axios from "axios";

const client = axios.create({
  baseURL: window.location.hostname === "localhost" && window.location.port === "5173"
    ? "http://localhost:8000/api/v1"   // local dev
    : "/api/v1",                        // Docker via Nginx proxy
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400) {
      return Promise.reject(error);
    }
    console.error("Unexpected API error:", error);
    return Promise.reject(error);
  }
);

export default client;