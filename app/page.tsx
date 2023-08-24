"use client";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { setUser } from "@/redux/features/user-slice";
export interface pageProps {}

export default function Page({}: pageProps) {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const userFromDb = useAppSelector((state) => state.userReducer.user);
  let socket = io("http://127.0.0.1:3333", {
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${session?.auth_Token}`,
        },
      },
    },
  });
  const getUserData = async function () {
    console.log(session);
    const userData = await fetch(
      `http://localhost:3333/users/${session?.user?.email}`
    );
    const dbUser = await userData.json();
    console.log(dbUser);
    dispatch(setUser(dbUser));
  };
  useEffect(() => {
    socketInitializer();
    getUserData();
  }, [session]);
  const [messages, setMessages] = useState<{ name: string; text: string }[]>(
    []
  );
  const [name, setName] = useState<string>("");
  const [joined, setJoined] = useState(false);
  const [newMessageText, setNewMessageText] = useState<null | string>("");
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const socketInitializer = async () => {
    socket.emit("findAllChat", {}, (mess: any) => {
      setMessages(mess);
      console.log(mess);
    });
    socket.on("messsage", (mess: { name: string; text: string }) => {
      setMessages((prev) => [...prev, mess]);
      // console.log(mess, "received");
      return "received";
    });
    socket.on("typing", ({ name, isTyping }) => {
      if (isTyping) {
        setIsTyping(name);
      } else {
        setIsTyping(null);
      }
    });
  };

  const sendHandler = async function () {
    socket.emit(
      "createChat",
      {
        text: newMessageText,
        name,
      },
      () => {
        console.log("sent", newMessageText);
      }
    );
  };
  // let timeout;
  // const emitTyping = async function () {
  //   socket.emit("typing", { isTyping: true });
  //   timeout = setTimeout(() => {
  //     socket.emit("typing", { isTyping: false });
  //   }, 2000);
  // };

  const joinHandler = async function () {
    socket.emit("join", {}, () => {
      setJoined(true);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <p className="">{userFromDb.name}</p>
      {!joined && (
        <div className="flex gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="name"
          ></input>
          <button onClick={joinHandler}>Join</button>
        </div>
      )}
      {joined && (
        <div className="flex gap-3">
          <input
            value={newMessageText!}
            onChange={(e) => {
              // emitTyping();
              setNewMessageText(e.target.value);
            }}
            placeholder="text"
          ></input>
          <button onClick={sendHandler}>Send</button>
        </div>
      )}

      {joined && (
        <div className="">
          {messages.map((m: { name: string; text: string }) => (
            <div key={m.text} className="">
              {" "}
              <p className="">
                {m.name} : {m.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
