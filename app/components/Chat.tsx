import React, {
  ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SocketContext } from "./SocketProvider";
import Avatar from "./Avatar";
import axios from "axios";

let image: string | ArrayBuffer;
import ScrollableFeed from "react-scrollable-feed";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Input } from "@/shardcn/components/ui/input";
import { useTheme } from "next-themes";
export interface Chat1Props {
  messages: Message[];
  groupId: string;
}
export default function Chat({ messages, groupId }: Chat1Props) {
  const videoFileRef = useRef<any>(null);
  const { theme } = useTheme();
  const imageFileRef = useRef<any>(null);
  let { socket } = useContext(SocketContext);

  const [chatHistory, setChatHistory] = useState<Message[] | null>(null);
  const [newMessageText, setNewMessageText] = useState<string | null>();
  const handleVideoButtonClick = () => {
    videoFileRef.current.click();
  };

  const handlePhotoButtonClick = () => {
    imageFileRef.current.click();
  };
  useEffect(() => {
    setChatHistory(messages);
    console.log(messages);
  }, [messages]);
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
  const uploadHandler = async function () {
    const curFile = videoFileRef.current.files[0];
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/s3/upload`,
      {
        filetype: curFile.type,
      }
    );
    console.log(data);
    const { uploadUrl, videoId } = data;
    await axios.put(uploadUrl, curFile);
    return videoId;
  };
  const convertToBase64 = (e: ChangeEvent<HTMLInputElement>) => {
    var reader = new FileReader();
    reader.readAsDataURL(e.target.files![0]);
    reader.onload = () => {
      console.log(reader.result);
      image = reader.result!;
    };
  };

  const { data: session } = useSession();
  const sendHandler = async function () {
    let videoId = "";
    console.log(videoFileRef.current.files.length);
    if (videoFileRef.current.files.length != 0) {
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
      (msg: Message) => {
        console.log("sent", newMessageText);
        setChatHistory((prev) => [...prev!, msg]);
      }
    );

    setNewMessageText("");
  };
  const playHandler = async function (filename: string) {
    console.log("play");
    const videoEl = document.getElementById(filename) as HTMLVideoElement;
    if (!videoEl.paused || videoEl.readyState >= 1) return;
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/download`,
      {
        filename,
        originalFilename: filename,
      },
      {
        headers: {
          "Authorization": `Bearer ${session?.authToken}`,
        },
      }
    );
    console.log(data);
    videoEl.src = data;
    setTimeout(() => {
      videoEl?.load();
      videoEl?.play();
    }, 200);
  };
  function scrollToBottom() {
    const messagesContainer = document.getElementById("messages");
    if (messagesContainer) {
      // messagesContainer.scrollTop = messagesContainer.scrollHeight;
      messagesContainer.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, []);
  return (
    <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-[75vh]  md:h-[85vh] justify-end">
      <ScrollableFeed forceScroll={true} className="space-y-4 p-1">
        {chatHistory?.map((m) => {
          return (
            <div key={m.timestamp}>
              {(m.image || m.text || m.video) &&
              m.senderName == session?.user?.name ? (
                <div className="chat-message">
                  <div className="flex items-end justify-end">
                    <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-1 items-end">
                      <div className="flex flex-col justify-end items-end">
                        {m.image && (
                          <img
                            className="rounded-2xl"
                            alt=""
                            height={23}
                            src={m.image}
                          ></img>
                        )}

                        {m.video && (
                          <video
                            className="rounded-2xl"
                            width={"320"}
                            height={"240"}
                            id={m.video}
                            controls
                            autoPlay
                            onClick={() => playHandler(m.video)}
                            onTouchStart={() => playHandler(m.video)}
                            poster="data:image/jpeg;base64,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"
                          ></video>
                        )}
                        {m.text && (
                          <span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white ">
                            {m.text}
                          </span>
                        )}
                        <p className="justify-self-end flex-wrap">
                          {m.senderName}
                        </p>
                      </div>
                    </div>

                    <Avatar classes="h-6 w-6 order-2" name={m.senderName} />
                  </div>
                </div>
              ) : (
                <div className="chat-message">
                  <div className="flex items-end">
                    <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 order-2 items-start">
                      <div>
                        {m.image && (
                          <img
                            className="rounded-2xl"
                            alt=""
                            height={23}
                            src={m.image}
                          ></img>
                        )}

                        {m.video && (
                          <video
                            className="rounded-2xl"
                            width={"320"}
                            height={"240"}
                            id={m.video}
                            controls
                            autoPlay
                            poster="data:image/jpeg;base64,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"
                            onClick={() => playHandler(m.video)}
                          ></video>
                        )}
                        {m.text && (
                          <span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">
                            {m.text}
                          </span>
                        )}
                        <p>{m.senderName}</p>
                      </div>
                    </div>
                    <Avatar classes="h-6 w-6 order-1" name={m.senderName} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </ScrollableFeed>

      <div
        className={` border-t-2 border-gray-${
          theme == "light" ? "200" : "500"
        } px-4 pt-4 mb-2 justify-self-end `}
      >
        <div className="flex align-center">
          <Input
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendHandler();
              }
            }}
            style={{
              width: "80%",
            }}
            value={newMessageText!}
            onChange={(e) => setNewMessageText(e.target.value)}
            placeholder="text"
            type="text"
            className={`focus:outline-none focus:placeholder-gray-400 text-gray-${
              theme == "light" ? "200" : "600"
            } placeholder-gray-600 pl-2 bg-gray-300 rounded-md py-3`}
          />
          <div className="flex align-center  items-center sm:flex">
            <button
              onClick={handlePhotoButtonClick}
              type="button"
              className="inline-flex  items-center bg-gray-300 justify-center py-5 h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-200 focus:outline-none"
            >
              <Image alt="" width={22} height={22} src="/gallery.png" />{" "}
            </button>
            <input
              type="file"
              ref={imageFileRef}
              accept="image/*"
              onChange={convertToBase64}
              style={{ display: "none" }}
            />

            <button
              onClick={handleVideoButtonClick}
              type="button"
              className="inline-flex  rounded-r-xl items-center bg-gray-300 justify-center h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-200 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 100 100"
                id="video"
              >
                <g>
                  <path d="M86 24H14c-1.1 0-2 .9-2 2v48c0 1.1.9 2 2 2h72c1.1 0 2-.9 2-2V26c0-1.1-.9-2-2-2zM26 72H16v-8h10v8zm0-12H16v-8h10v8zm0-12H16v-8h10v8zm0-12H16v-8h10v8zm44 36H30V28h40v44zm14 0H74v-8h10v8zm0-12H74v-8h10v8zm0-12H74v-8h10v8zm0-12H74v-8h10v8z"></path>
                </g>
                <g>
                  <path
                    fill="#00F"
                    d="M804-650v1684H-980V-650H804m8-8H-988v1700H812V-658z"
                  ></path>
                </g>
              </svg>
            </button>
            <input
              type="file"
              accept="video/*"
              ref={videoFileRef}
              style={{ display: "none" }}
            />

            <button
              onClick={sendHandler}
              type="button"
              className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
            >
              <span className="font-bold">Send</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 ml-2 transform rotate-90"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
