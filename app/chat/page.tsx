"use client";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useSession } from "next-auth/react";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/features/user-slice";
import { SocketContext } from "../components/SocketProvider";
export interface pageProps {}

interface messageType {
  name: string;
  text: string;
  groupId: string;
}

export default function Page({}: pageProps) {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const userFromDb = useAppSelector((state) => state.userReducer.user);
  let { socket } = useContext(SocketContext);
  const getUserData = async function () {
    const userData = await fetch(
      `http://localhost:3333/users/${session?.user?.email}`
    );
    let dbUser;
    try {
      dbUser = await userData.json();
      console.log(dbUser);
    } catch (e) {}
    dispatch(setUser(dbUser));
  };
  useEffect(() => {
    if (userFromDb?.name) console.log("userFromDb", userFromDb);
    getUserData();
    socket?.emit("join", {}, () => {
      setJoined(true);
    });
    socket?.emit("findAllChat", {}, (mess: any) => {
      setMessages(mess);
      console.log(mess);
    });
    socket?.on("messsage", (msg: messageType) => {
      setMessages((prev) => [...prev, msg]);
      console.log(msg, "received");
      return "received";
    });
    socket?.on("usersOnline", (data: any) => {
      console.log(data);
    });

    console.log(socket);
    return () => {
      socket?.off("message");
    };
  }, [session, socket]);
  const [messages, setMessages] = useState<
    { name: string; text: string; groupId: string }[]
  >([]);
  const textGroup = useRef<HTMLInputElement>();
  const [joined, setJoined] = useState(false);
  const [newMessageText, setNewMessageText] = useState<null | string>("");

  const sendHandler = async function () {
    console.log(newMessageText, textGroup.current!.value);
    console.log(userFromDb);
    socket.emit(
      "createChat",
      {
        text: newMessageText,
        groupId: String(
          userFromDb.groups[Number(textGroup.current!.value)]._id
        ),
      },
      (msg: messageType) => {
        console.log("sent", newMessageText);
        // setMessages((prev) => [...prev, msg]);
      }
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 overflow-y-scroll">
      {/* {!joined && (
        <div className="flex gap-3">
          <button onClick={joinHandler}>Join</button>
        </div>
      )} */}
      {joined && (
        <div className="flex gap-3">
          <select defaultValue={"0"} ref={textGroup}>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
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
          {messages.map((m: messageType) => (
            <div key={m.text} className="">
              {" "}
              <p className="">
                {m.name} from {m.groupId} : {m.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
