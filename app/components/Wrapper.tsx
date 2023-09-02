"use client";
import React, { ReactNode, useContext, useEffect } from "react";
import { SocketContext } from "./SocketProvider";

export interface WrapperProps {
  children: ReactNode;
}
export default function Wrapper({ children }: WrapperProps) {
  let { socket } = useContext(SocketContext);

  useEffect(() => {
    socket?.emit("join", (callStatus: any) => {
      console.log(callStatus);
    });
    socket?.on("message", (message: Message) => {
      console.log("message rec", message);
      return message;
    });
    console.log("joined again");
  }, [socket]);

  return <>{children}</>;
}
