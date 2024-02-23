import React, { createContext, useEffect, useState, ReactNode, useRef } from 'react';
import { userMedia } from "@/lib/media";
import { SocketContextType } from "@/types/socket";
import { socket } from "@/lib/socket";
// import { Peer } from "simple-peer";
import { Peer } from "peerjs";

export const SocketContext = createContext<SocketContextType>({
    myVideoRef: { current: null },
    userVideoRef: { current: null },
    me: "",
    user: "",
    callUser: () => { },
    answerCall: () => { }
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {

    const myVideoRef = useRef<HTMLVideoElement>(null);
    const userVideoRef = useRef<HTMLVideoElement>(null);
    const [me, setMe] = useState("");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [call, setCall] = useState({ from: "", signalData: {} });
    const [peer, setPeer] = useState<Peer | null>(null);

    useEffect(() => {
        async function getStream(socketId) {
            const myStream = await userMedia();

            if (myVideoRef.current) {
                myVideoRef.current.srcObject = myStream;
            }

            const myPeer = new Peer(socketId);
            myPeer.on("call", (call) => {
                console.log("Call received", call, stream);
                call.answer(myStream); // Answer the call with an A/V stream.
                call.on("stream", (remoteStream) => {
                    if (userVideoRef.current) {
                        userVideoRef.current.srcObject = remoteStream;
                    }
                });
            })

            setPeer(myPeer);
            setStream(myStream);
        }

        const onConnect = () => {
            if (socket.id) {
                
                setMe(socket.id)
                getStream(socket.id);
            }
        }
        const onDisconnect = () => { setMe(""); }

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        socket.on("call-mode", (data: any) => {
            console.log("call mode", data);
            setCall(data)

            if (stream && peer) {
                console.log("Calling user", id);
                console.log("Stream", stream);

                const call = peer.call(id, stream);
                call.on("stream", (remoteStream) => {
                    console.log("Remote Stream", remoteStream);
                    if (userVideoRef.current) {
                        userVideoRef.current.srcObject = remoteStream;
                    }
                });

                peer.on("call", (call) => {
                    console.log("Call received", call);
                    call.answer(stream);
                    call.on("stream", (remoteStream) => {
                        if (userVideoRef.current) {
                            userVideoRef.current.srcObject = remoteStream;
                        }
                    });
                });

            } else {
                alert("Peer or Stream not available")
            }

        })

        

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('call-mode', onConnect);
        }
    }, []);

    const callUser = (id: string) => {
        if (stream && peer) {
            console.log("Calling user", id);
            console.log("Stream", stream);
            console.log("Peer", peer);

            const call = peer.call(id, stream);
            call.on("stream", (remoteStream) => {
                console.log("Remote Stream", remoteStream);
                if (userVideoRef.current) {
                    userVideoRef.current.srcObject = remoteStream;
                }
            });
        } else {
            alert("Peer or Stream not available")
        }
    };

    const answerCall = () => {
        // // let Peer = require('simple-peer');
        // const peer = new Peer({ initiator: false, trickle: false, stream });

        // peer.on('signal', (data: any) => {
        //     console.log("Signal on Answer", data);
        //     socket.emit('call-answer', { 
        //         to: call.from,
        //         signalData: data,
        //     });
        // });

        // peer.on('stream', (userStream: MediaStream) => {
        //     console.log("Stream answer Receiveed userStream", userStream);
        //     if (userVideoRef.current) {
        //         userVideoRef.current.srcObject = userStream;
        //     }
        // });

        // peer.signal(call.signalData);
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
