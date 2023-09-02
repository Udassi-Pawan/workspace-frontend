"use client";
import React, { ReactNode, useContext, useEffect } from "react";
import { SocketContext } from "./SocketProvider";

export interface WrapperProps {
  children: ReactNode;
}
export default function Wrapper({ children }: WrapperProps) {
  let { socket } = useContext(SocketContext);

  useEffect(() => {
    socket?.emit("join", () => {});
    socket?.on("message", (message: Message) => {
      console.log("message rec", message);
      return message;
    });
  }, [socket]);

  return <>{children}</>;
}
