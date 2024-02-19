import React, { createContext, useEffect, useState, ReactNode, useRef } from 'react';
import { userMedia } from "@/lib/media";
import { SocketContextType } from "@/types/socket";
import { socket } from "@/lib/socket";
// import { Peer } from "simple-peer";

export const SocketContext = createContext<SocketContextType>({
    myVideoRef: { current: null },
    userVideoRef: { current: null },
    me: "",
    user: "",
    callUser: () => {},
    answerCall: () => {}
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {

    const myVideoRef = useRef<HTMLVideoElement>(null);
    const userVideoRef = useRef<HTMLVideoElement>(null);
    const [me, setMe] = useState("");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [call, setCall] = useState({from: "", signalData: {}});
    useEffect(() => {
        async function getStream() {
            const myStream = await userMedia();

            if (myVideoRef.current) {
                myVideoRef.current.srcObject = myStream;
            }

            setStream(myStream);
        }

        const onConnect = () => { 
            console.log("Socket Connected", socket);
            setMe(socket.id || "") 
        }
        const onDisconnect = () => { setMe(""); }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        socket.on("call-mode", (data: any) => {
            console.log("call mode", data);
            setCall(data)
        })

        getStream();

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('call-mode', onConnect);
        }
    }, []);

    const callUser = (id: string) => {
        let Peer = require('simple-peer');
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on('signal', (data: any) => {
            console.log("Signal on Call", data);
            socket.emit('call-user', {
                to: id, 
                signalData: data, 
                // from: me
            });
        });

        peer.on('stream', (userStream: MediaStream) => {
            console.log("Stream Receiveed userStream", userStream);
            if (userVideoRef.current) {
                userVideoRef.current.srcObject = userStream;
            }
        })

        socket.on('answer-mode', async (data) => {
            peer.signal(data.signalData);
        });
    };

    const answerCall = () => {
        let Peer = require('simple-peer');
        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on('signal', (data: any) => {
            console.log("Signal on Answer", data);
            socket.emit('call-answer', { 
                to: call.from,
                signalData: data,
            });
        });

        peer.on('stream', (userStream: MediaStream) => {
            console.log("Stream answer Receiveed userStream", userStream);
            if (userVideoRef.current) {
                userVideoRef.current.srcObject = userStream;
            }
        });

        peer.signal(call.signalData);
    };

    return (
        <SocketContext.Provider
            value={{
                myVideoRef,
                userVideoRef,
                me,
                user: call.from,
                callUser,
                answerCall
            }}>
            {children}
        </SocketContext.Provider>
    );
};
