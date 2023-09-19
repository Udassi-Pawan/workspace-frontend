import React, {
  ChangeEvent,
  useCallback,
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
import axios from "axios";
import { useSession } from "next-auth/react";

export default function Chat({ groupId, _chatHistory }: ChatProps) {
  const videoFileRef = useRef<any>(null);
  let { socket } = useContext(SocketContext);
  const { data: session } = useSession();
  const [chatHistory, setChatHistory] = useState<Message[] | null>(null);
  const [newMessageText, setNewMessageText] = useState<string | null>();
  const uploadHandler = async function () {
    const curFile = videoFileRef.current.files[0];
    const { data } = await axios.post("http://localhost:3333/s3/upload", {
      filetype: curFile.type,
    });
    console.log(data);
    const { uploadUrl, videoId } = data;
    await axios.put(uploadUrl, curFile);
    return videoId;
  };

  const sendHandler = async function () {
    let videoId = "";
    if (videoFileRef.current != null) {
      videoId = await uploadHandler();
    }
    socket?.emit(
      "createChat",
      {
        text: newMessageText,
        groupId,
        image,
        video: videoId,
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
  const playHandler = async function (filename: string) {
    const { data } = await axios.post(
      `http://localhost:3333/files/download`,
      {
        filename,
      },
      {
        headers: {
          "Authorization": `Bearer ${session?.authToken}`,
        },
      }
    );
    console.log(data);
    const videoEl = document.getElementById(filename) as HTMLVideoElement;
    videoEl.src = data;
    setTimeout(() => {
      videoEl?.load();
      videoEl?.play();
    }, 200);
  };

  return (
    <>
      <input
        value={newMessageText!}
        onChange={(e) => setNewMessageText(e.target.value)}
        placeholder="text"
      />
      {/* <input type="file" id="actual-btn" onChange={convertToBase64} /> */}
      <input ref={videoFileRef} type={"file"}></input>
      {/* <EmojiPicker onEmojiClick={emojiHandler} /> */}
      <button onClick={sendHandler}>send message</button>
      <div className="">
        {chatHistory?.map((text) => (
          <div key={text.timestamp}>
            {text.image && <img className="h-14" src={text.image}></img>}
            {text.video && (
              <div className="">
                <video
                  width={"320"}
                  height={"240"}
                  id={text.video}
                  controls
                ></video>
                <p className="">{text.video}</p>
                <button onClick={() => playHandler(text.video)} className="">
                  play
                </button>
              </div>
            )}
            <p className="">
              {text.senderName} : {text.text}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
