"use client";
import axios from "axios";
import { SocketContext } from "@/app/components/SocketProvider";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Chat from "@/app/components/Chat";
import GroupDrive from "@/app/components/GroupDrive";
import { Button } from "@/shardcn/components/ui/button";
import Image from "next/image";
import GroupInfo from "@/app/components/GroupInfo";
import Draw from "@/app/components/Draw";
import Collab from "@/app/components/Collab";
import Link from "next/link";
import { useSession } from "next-auth/react";

const menuItems = [
  {
    name: "chat",
    color: "orange",
  },
  {
    name: "docs",
    color: "green",
  },
  {
    name: "draw",
    color: "red",
  },
  {
    name: "drive",
    color: "yellow",
  },
];

function getClassForNavButtons(color: string, curPage: string, name: string) {
  const string = new String(
    `bg-${
      curPage == name ? `${color}-500` : "gray-300"
    } text-gray-800 font-bold rounded border-b-2 border-${color}-500 hover:border-${color}-600  hover:bg-${color}-500 hover:text-white shadow-md inline-flex items-center`
  );
  return string;
}

export default function Page({ params }: { params: { groupId: string } }) {
  const { data: session } = useSession();
  let { socket } = useContext(SocketContext);
  const [group, setGroup] = useState<Group | null>(null);
  const [usersOnline, setUsersOnline] = useState<User[] | null>(null);
  const [thisGroupCallStatus, setThisGroupCallStatus] = useState<any>(null);
  useEffect(() => {
    console.log("session", session);
    if (!session?.authToken) return;
    async function getData() {
      const groupFromDb = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/group/single/${params.groupId}`,
        {
          headers: {
            "Authorization": `Bearer ${session?.authToken}`,
          },
        }
      );
      console.log("groipdata", groupFromDb.data);
      setGroup(groupFromDb.data);
    }
    getData();
  }, [session?.authToken, params.groupId, session]);
  const { setTheme, theme } = useTheme();
  const themeHandler = async function () {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const userOnlineHandler = ({ usersOnline, callStatus }: any) => {
    setUsersOnline(usersOnline);
    setThisGroupCallStatus(callStatus);
    console.log("callStatus", callStatus);
  };

  useEffect(() => {
    if (!group || group._id == "none") return;
    socket?.emit("usersOnline", { groupId: params.groupId }, userOnlineHandler);
    socket?.on(`usersOnline${group?._id}`, userOnlineHandler);
    socket?.on(`callStatus${group?._id}`, (_callStatus: any) => {
      console.log("received callstatus", _callStatus);
      setThisGroupCallStatus(_callStatus);
    });
  }, [socket, group?._id, group, params.groupId]);
  useEffect(() => {
    setCurTheme(theme);
  }, [theme]);
  const [curTheme, setCurTheme] = useState(theme);
  const [curPage, setCurPage] = useState<string>("chat");
  const joinHandler = async function () {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/join`,
      {
        groupId: params.groupId,
      },
      {
        headers: {
          "Authorization": `Bearer ${session?.authToken}`,
        },
      }
    );
    console.log(data);
  };
  return (
    <div>
      {group?._id == "none" && (
        <div className="flex flex-col items-center justify-center gap-5 h-[100vh]">
          <h1 className="text-4xl">Not a member yet.</h1>
          <Button size={"lg"} onClick={joinHandler}>
            Join
          </Button>
        </div>
      )}

      {group && group._id != "none" && (
        <div className="flex justify-between">
          <div className="flex-1 sm:p-1 justify-start">
            <div className={`flex items-center justify-between `}>
              <div className="relative flex p-1 items-center space-x-4">
                <div className="relative">
                  <span className="absolute text-green-500 right-0 bottom-0">
                    <svg width="20" height="20">
                      <circle cx="8" cy="8" r="8" fill="currentColor"></circle>
                    </svg>
                  </span>
                  <img
                    src="https://images.unsplash.com/photo-1549078642-b2ba4bda0cdb?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144"
                    alt=""
                    className="w-10 sm:w-16 h-10 sm:h-16 rounded-full"
                  />
                </div>
                <div className="flex flex-col leading-tight">
                  <div className="text-2xl flex items-center">
                    <span className={`mr-3`}>{group?.name}</span>
                  </div>
                  <span className={`text-md`}>description</span>
                </div>
              </div>
              <>
                {" "}
                {menuItems.map((m) => (
                  <div
                    key={m.name + m.name + m.name}
                    className="hidden md:flex"
                  >
                    <Button
                      onClick={() => setCurPage(m.name)}
                      className={
                        getClassForNavButtons(m.color, curPage, m.name) +
                        " py-2 px-6 "
                      }
                    >
                      <span className="mr-2">
                        {m.name[0].toUpperCase() + m.name.slice(1)}
                      </span>
                      <Image
                        alt=""
                        width={"20"}
                        height={"20"}
                        src={`/${m.name}.png`}
                      ></Image>
                    </Button>
                  </div>
                ))}
              </>
              {thisGroupCallStatus && thisGroupCallStatus.length ? (
                <Link href={`/video/${group?._id}`}>
                  <div className="flex items-center mr-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-3xl border transition bg-green-400 py-2 px-3  duration-500 ease-in-out text-gray-500 hover:bg-green-300 focus:outline-none"
                    >
                      <svg
                        fill="green-900"
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 100 100"
                        id="video"
                      >
                        <g>
                          <path d="M84.9 26.4L68 37.3V34c0-4.4-3.6-8-8-8H20c-4.4 0-8 3.6-8 8v32c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-3.3l16.9 10.9c1.9 1 3.1-.7 3.1-1.7V28c0-1-1.1-2.8-3.1-1.6zM64 66c0 2.2-1.8 4-4 4H20c-2.2 0-4-1.8-4-4V34c0-2.2 1.8-4 4-4h40c2.2 0 4 1.8 4 4v32zm20 2.3L68 58V42l16-10.3v36.6z"></path>
                        </g>
                        <g>
                          <path
                            fill="#00F"
                            d="M1224-650v1684H-560V-650h1784m8-8H-568v1700h1800V-658z"
                          ></path>
                        </g>
                      </svg>
                      <p className="ml-2 text-xl text-green-900">JOIN</p>
                    </button>
                  </div>
                </Link>
              ) : (
                <Link href={`/video/${group?._id}`}>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl border transition bg-gray-200   duration-500 ease-in-out text-gray-500 hover:bg-green-300 focus:outline-none"
                    style={{
                      width: "50px", // Set a fixed width
                      height: "37px", // Set a fixed height
                    }}
                  >
                    <svg
                      fill="green-900"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 100 100"
                      id="video"
                    >
                      <g>
                        <path d="M84.9 26.4L68 37.3V34c0-4.4-3.6-8-8-8H20c-4.4 0-8 3.6-8 8v32c0 4.4 3.6 8 8 8h40c4.4 0 8-3.6 8-8v-3.3l16.9 10.9c1.9 1 3.1-.7 3.1-1.7V28c0-1-1.1-2.8-3.1-1.6zM64 66c0 2.2-1.8 4-4 4H20c-2.2 0-4-1.8-4-4V34c0-2.2 1.8-4 4-4h40c2.2 0 4 1.8 4 4v32zm20 2.3L68 58V42l16-10.3v36.6z"></path>
                      </g>
                      <g>
                        <path
                          fill="#00F"
                          d="M1224-650v1684H-560V-650h1784m8-8H-568v1700h1800V-658z"
                        ></path>
                      </g>
                    </svg>
                  </button>
                </Link>
              )}
            </div>

            <div className="md:hidden flex justify-between justify-self-start space-x-2 p-2 border-b-2">
              {menuItems.map((m) => (
                <Button
                  key={m.name + "chota"}
                  onClick={() => setCurPage(m.name)}
                  className={`bg-${
                    curPage == m.name ? `${m.color}-500` : "gray-300"
                  } text-gray-800 font-bold rounded border-b-2 border-${
                    m.color
                  }-500 hover:border-${m.color}-600 hover:bg-${
                    m.color
                  }-500 hover:text-white shadow-md py-2 px-2 inline-flex items-center`}
                >
                  <span className="mr-2">
                    {m.name[0].toUpperCase() + m.name.slice(1)}
                  </span>{" "}
                  <Image
                    alt=""
                    width={"20"}
                    height={"20"}
                    src={`/${m.name}.png`}
                  ></Image>
                </Button>
              ))}
            </div>

            <div
              style={{
                top: "7rem",
              }}
              className="my-2  hidden sm:flex absolute left-70 w-screen border-b border-gray-300"
            ></div>

            {curPage == "chat" && (
              <Chat
                messages={group?.history!}
                groupId={group?._id!}
                curTheme={theme!}
              />
            )}
            {curPage == "drive" && (
              <GroupDrive groupId={group?._id!} files={group?.files!} />
            )}
            {curPage == "draw" && group?._id && <Draw groupId={group?._id!} />}
            {curPage == "docs" && (
              <Collab groupId={group?._id!} docs={group?.docs!} />
            )}
          </div>
          <div className="md:flex border-l border-gray-300 min-h-screen "></div>

          <GroupInfo
            groupId={params.groupId}
            members={group?.members}
            usersOnline={usersOnline!}
          />
          {/* <button onClick={themeHandler}>toggle</button> */}
        </div>
      )}
    </div>
  );
}
