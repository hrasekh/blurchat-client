import React, { useContext, useState } from "react";
import { SocketContext } from "@/context/SocketContext";
// import { Video } from "@/types/video";

interface VideoPlayerProps { }

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ }) => {
  const style = require('./VideoPlayer.module.css');
  const socket = useContext(SocketContext);
  const [userId, setUserId] = useState<string>("");

  return (
    <div className="flex items-center justify-center">
      <video
        className={`h-full w-full ${style.mirrored}`}
        autoPlay
        playsInline
        loop
        ref={socket.myVideoRef}
      />
      <p>My ID: {socket.me}</p>

      <video
        className={`h-full w-full ${style.mirrored}`}
        autoPlay
        playsInline
        ref={socket.userVideoRef}
      />

      <input type="text"
        placeholder="Enter user id"
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={() => {
        socket.callUser(userId);
      }}>Call</button>

      {/* {socket.user && */}
        <button onClick={() => {
          socket.answerCall(socket.user);
        }}>Answer</button>
      {/* } */}
    </div>
  );
};