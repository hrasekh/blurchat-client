import { RefObject } from 'react';

export type SocketContextType = {
    myVideoRef: RefObject<HTMLVideoElement>;
    userVideoRef: RefObject<HTMLVideoElement>;
    me: string;
    user: string;
    callUser: (id: string) => void;
    answerCall: (id: string) => void;
};