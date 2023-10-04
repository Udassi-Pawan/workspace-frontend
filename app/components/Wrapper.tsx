"use client";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { SocketContext } from "./SocketProvider";
import "./Wrapper.css";
import { signOut, useSession } from "next-auth/react";
import { requestNotificationPermission } from "../helper/pushNotifications";
import axios from "axios";
import { getMessaging, onMessage } from "firebase/messaging";
import { useTheme } from "next-themes";
import Image from "next/image";

export interface WrapperProps {
  children: ReactNode;
}
export default function Wrapper({ children }: WrapperProps) {
  let { socket } = useContext(SocketContext);
  const [myTheme, setMyTheme] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  // useEffect(() => {
  //   if (session?.authToken) {
  //     (async function () {
  //       const notificationToken = await requestNotificationPermission();
  //       console.log("notification token ", notificationToken);
  //       if (notificationToken) {
  //         await axios.post(
  //           `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/token`,
  //           { token: notificationToken },
  //           {
  //             headers: {
  //               "Authorization": `Bearer ${session?.authToken}`,
  //             },
  //           }
  //         );
  //       }
  //     })();
  //   }

  //   const messaging = getMessaging();
  //   onMessage(messaging, (payload) => {
  //     console.log("Message received. ", payload);
  //     // ...
  //   });
  // // }, [session?.authToken]);
  // useEffect(() => {
  //   if ("serviceWorker" in navigator) {
  //     navigator.serviceWorker
  //       .register("/firebase-messaging-sw.js")
  //       .then((registration) => {
  //         registration.pushManager
  //           .getSubscription()
  //           .then((res) => console.log(res));
  //         navigator.serviceWorker.ready.then((registration) => {
  //           const channel = new BroadcastChannel("myChannel");
  //           const dataToSend = {
  //             apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  //             authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  //             projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  //             storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  //             messagingSenderId:
  //               process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  //             appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  //             measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  //           };
  //           channel.postMessage(dataToSend);
  //         });
  //       });
  //   }
  // }, []);

  useEffect(() => {
    setMyTheme(theme!);
  }, [theme]);
  useEffect(() => {
    if (!socket) return;
    socket?.emit("join", (callStatus: any) => {
      console.log(callStatus);
    });
    socket?.on("message", (message: Message) => {
      console.log("message rec", message);
      return message;
    });
    console.log("joined again");
  }, [socket]);

  return (
    <div className="">
      <div className="p-1 h-10 flex items-center justify-between">
        <p className="text-xl text-bolder">HOME</p>
        <p>Workspace</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setTheme(theme == "dark" ? "light" : "dark")}>
            <Image
              style={{
                filter:
                  myTheme == "dark"
                    ? "brightness(0) invert(1)"
                    : "brightness(100%) invert(0)",
              }}
              className={`${myTheme == "light" ? "filter-invert" : ""} mt-2`}
              src={`${
                myTheme == "light" ? "/light-mode.png" : "/dark-mode.png"
              }`}
              height="30"
              width="30"
              alt="light-mode"
            ></Image>
          </button>
          <button
            onClick={() => signOut()}
            className="BtnLogout w-10 mt-5 mb-2"
          >
            <div className="signLogout">
              <svg viewBox="0 0 512 512">
                <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
              </svg>
            </div>
            <div className="textLogout">Logout</div>
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
