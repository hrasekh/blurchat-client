import { io } from "socket.io-client";

export const socket = io("http://127.0.0.1:5678");

export const onConnect = (callback: () => void) => {
    socket.on('connect', callback);
};

export const offConnect = (callback: () => void) => {
    socket.off('connect', callback);
};
