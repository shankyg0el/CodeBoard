import { io } from "socket.io-client";
const serverURL = import.meta.env.VITE_SERVER_URL;

export const initSocket = async () => {
  const options = {
    transports: ["websocket"],
    jsonp: false,
    forceNew: true,
  };

  return io(serverURL, options);
};
