import { io } from "socket.io-client";
import axios from "axios";

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  auth: (cb) => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/socket-token`, { withCredentials: true })
      .then((res) => cb({ token: res.data.token }))
      .catch(() => cb({}));
  },
});

