import { io } from "socket.io-client";

export const socket = io("http://192.168.179.3:5678");

export const onConnect = (callback: () => void) => {
    socket.on('connect', callback);
};

export const offConnect = (callback: () => void) => {
    socket.off('connect', callback);
};
