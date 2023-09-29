"use client";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import { io } from "socket.io-client";

export interface SocketProviderProps {
  children: React.ReactNode;
}

import { createContext, useState } from "react";

const SocketContext = createContext<any>(null);
export { SocketContext };

const iceServers = [
  {
    url: "stun:global.stun.twilio.com:3478",
    // urls: "stun:global.stun.twilio.com:3478",
  },
  {
    url: "turn:global.turn.twilio.com:3478?transport=udp",
    username:
      "a939e485500fe0ea3ed2f216929f5a3f9bcb71b7ae47c0d70d3178eb61a47aaf",
    // urls: "turn:global.turn.twilio.com:3478?transport=udp",
    credential: "ZQStZHd9+N0rq5pjVxRmO0UaycAbbA/m+/XerXQ3RRY=",
  },
  {
    url: "turn:global.turn.twilio.com:3478?transport=tcp",
    username:
      "a939e485500fe0ea3ed2f216929f5a3f9bcb71b7ae47c0d70d3178eb61a47aaf",
    // urls: "turn:global.turn.twilio.com:3478?transport=tcp",
    credential: "ZQStZHd9+N0rq5pjVxRmO0UaycAbbA/m+/XerXQ3RRY=",
  },
  {
    url: "turn:global.turn.twilio.com:443?transport=tcp",
    username:
      "a939e485500fe0ea3ed2f216929f5a3f9bcb71b7ae47c0d70d3178eb61a47aaf",
    // urls: "turn:global.turn.twilio.com:443?transport=tcp",
    credential: "ZQStZHd9+N0rq5pjVxRmO0UaycAbbA/m+/XerXQ3RRY=",
  },
];

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<any>(null);
  const [peer, setPeer] = useState<any>(null);
  const [socketId, setSocketId] = useState<any>(null);
  const { data: session } = useSession();
  console.log("peer in socket provider ", peer);
  useEffect(() => {
    if (session) {
      const client = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${session?.authToken}`,
            },
          },
        },
      });
      setSocket(client);
      setSocketId(client.id);
    }
  }, [session?.authToken]);

  useEffect(() => {
    if (socket) {
      console.log("socketId now", socket.id);
      import("peerjs").then(({ default: Peer }) => {
        const mypeer = new Peer(socket.id, {
          "config": { "iceServers": iceServers },
        });
        setPeer(mypeer);
        console.log("mypeer", mypeer);
      });
    }
  }, [socket]);
  return (
    <SocketContext.Provider value={{ socket, peer }}>
      {children}
    </SocketContext.Provider>
  );
}
