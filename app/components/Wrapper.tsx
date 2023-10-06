"use client";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
import "./Wrapper.css";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface WrapperProps {
  children: ReactNode;
}
export default function Wrapper({ children }: WrapperProps) {
  let { socket } = useContext(SocketContext);
  const [myTheme, setMyTheme] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();

  useEffect(() => {
    setMyTheme(theme!);
  }, [theme]);
  useEffect(() => {
    setTimeout(() => {
      try {
        document
          .querySelector("df-messenger")
          .shadowRoot.querySelector(".df-messenger-wrapper")
          .querySelector("#widgetIcon").style.bottom = "10vh";
      } catch (e) {}
    }, 3000);
  }, []);
  useEffect(() => {
    if (!socket) return;
    socket?.emit("join", (callStatus: any) => {
      console.log(callStatus);
    });
    socket?.on("message", (message: Message) => {
      console.log("message rec", message);
      toast.info(
        `Message from ${message.senderName} : ${message.text} : ${
          message.image != "" ? " image" : ""
        } : ${message.video != "" ? " video " : ""}`
      );
      return message;
    });
    console.log("joined again");
  }, [socket]);

  return (
    <div className="">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={myTheme}
      />
      <div className="my-3 mx-2 sm:m-1 h-10 flex items-center justify-between">
        <Link href="/">
          <h5 className=" font-bold">Workspace</h5>
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme == "dark" ? "light" : "dark")}>
            <Image
              style={{
                filter:
                  myTheme == "dark"
                    ? "brightness(0) invert(1)"
                    : "brightness(100%) invert(0)",
              }}
              className={`${myTheme == "light" ? "filter-invert" : ""}`}
              src={`${
                myTheme == "light" ? "/light-mode.png" : "/dark-mode.png"
              }`}
              height="30"
              width="30"
              alt="light-mode"
            ></Image>
          </button>
          {session?.authToken && (
            <button
              onClick={() => signOut()}
              className="BtnLogout w-10 mb-2 mt-2"
            >
              <div className="signLogout">
                <svg viewBox="0 0 512 512">
                  <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                </svg>
              </div>
              <div className="textLogout">Logout</div>
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
