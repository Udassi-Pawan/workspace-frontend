import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SocketContext } from "./SocketProvider";

export interface ChatProps {
  groupId: string;
  _chatHistory: Message[];
}

let image: string | ArrayBuffer;
import EmojiPicker from "emoji-picker-react";

export default function Chat({ groupId, _chatHistory }: ChatProps) {
  let { socket } = useContext(SocketContext);
  const [chatHistory, setChatHistory] = useState<Message[] | null>(null);
  const [newMessageText, setNewMessageText] = useState<string | null>();
  const sendHandler = async function () {
    socket?.emit(
      "createChat",
      {
        text: newMessageText,
        groupId,
        image,
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
      socket?.off(`message ${groupId}`);
    };
  }, [socket, groupId]);

  console.log("render");

  const convertToBase64 = (e: ChangeEvent<HTMLInputElement>) => {
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files![0]);
    reader.onload = () => {
      console.log(reader.result);
      image = reader.result!;
    };
  };

  const emojiHandler = async function (emoji: { emoji: string }) {
    setNewMessageText((prev) => prev + emoji.emoji);
  };

  return (
    <>
      <input
        value={newMessageText!}
        onChange={(e) => setNewMessageText(e.target.value)}
        placeholder="text"
      />
      <input type="file" id="actual-btn" onChange={convertToBase64} />
      {/* <EmojiPicker onEmojiClick={emojiHandler} /> */}
      <button onClick={sendHandler}>send message</button>
      <div className="">
        {chatHistory?.map((text) => (
          <div key={text.timestamp}>
            {text.image && <img className="h-14" src={text.image}></img>}
            <p className="">
              {text.senderName} : {text.text}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
