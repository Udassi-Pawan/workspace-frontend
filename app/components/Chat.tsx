import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "./SocketProvider";

export interface ChatProps {
  groupId: string;
  _chatHistory: Message[];
}
export default function Chat({ groupId, _chatHistory }: ChatProps) {
  let { socket } = useContext(SocketContext);
  const [chatHistory, setChatHistory] = useState<Message[] | null>(null);
  const newMessageText = useRef<HTMLInputElement>(null);
  const sendHandler = async function () {
    socket.emit(
      "createChat",
      {
        text: newMessageText.current!.value,
        groupId,
      },
      (msg: any) => {
        console.log("sent", newMessageText);
      }
    );
  };
  useEffect(() => {
    setChatHistory(_chatHistory);
  }, [_chatHistory]);
  useEffect(() => {
    if (!groupId) return;
    console.log(groupId);
    socket?.on(`message ${groupId}`, (message: Message) => {
      setChatHistory((prev) => [...prev!, message]);
      return message;
    });
    return () => {
      socket.off(`message ${groupId}`);
    };
  }, [socket, groupId]);

  console.log("render");
  return (
    <>
      <input ref={newMessageText} placeholder="text" />
      <button onClick={sendHandler}>send</button>
      <div className="">
        {chatHistory?.map((text) => (
          <p key={text.timestamp} className="">
            {text.senderName} : {text.text}
          </p>
        ))}
      </div>
    </>
  );
}
