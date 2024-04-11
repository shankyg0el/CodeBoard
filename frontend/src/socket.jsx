import { io } from "socket.io-client";
const serverURL = import.meta.env.VITE_SERVER_URL;

export const initSocket = async () => {
  const options = {
    "force new connection": true,
    reconnectionAttempts: "Infinity",
    timeout: 10000,
    transports: ["websocket"],
  };

  return io(serverURL, options);
};
