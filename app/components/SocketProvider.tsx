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

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<any>(null);
  const { data: session } = useSession();
  //   console.log("session in ", session);
  useEffect(() => {
    if (session) {
      const client = io("http://127.0.0.1:3333", {
        transportOptions: {
          polling: {
            extraHeaders: {
              Authorization: `Bearer ${session?.authToken}`,
            },
          },
        },
      });
      setSocket(client);
    }
    // console.log("socket rebuilding");
  }, [typeof session]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
