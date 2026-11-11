import axios from "axios";
import { socket } from "./socket";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (socket.id) config.headers["X-Socket-Id"] = socket.id;
  return config;
  });

export const getErrorMessage = (error) =>
  error.response?.data?.message || "Something went wrong. Please try again.";

export default api;