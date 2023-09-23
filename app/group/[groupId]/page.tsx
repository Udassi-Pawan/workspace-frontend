"use client";
import axios from "axios";
import { SocketContext } from "@/app/components/SocketProvider";
import { useContext, useEffect, useState } from "react";
import Online from "@/app/components/Online";
import Chat from "@/app/components/Chat";
import { useRouter } from "next/navigation";
import Collab from "@/app/components/Collab";
import GroupDrive from "@/app/components/GroupDrive";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

export default function Page({ params }: { params: { groupId: string } }) {
  const router = useRouter();
  let { socket } = useContext(SocketContext);
  const [group, setGroup] = useState<Group | null>(null);
  const [usersOnline, setUsersOnline] = useState<User[] | null>(null);
  const [thisGroupCallStatus, setThisGroupCallStatus] = useState<any>(null);
  useEffect(() => {
    async function getData() {
      const groupFromDb = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/group/single/${params.groupId}`
      );
      console.log(groupFromDb.data);
      setGroup(groupFromDb.data);
    }
    getData();
  }, []);
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
    if (!group) return;
    socket?.emit("usersOnline", { groupId: params.groupId }, userOnlineHandler);
    socket?.on(`usersOnline${group?._id}`, userOnlineHandler);
    socket?.on(`callStatus${group?._id}`, (_callStatus: any) => {
      console.log("received callstatus", _callStatus);
      setThisGroupCallStatus(_callStatus);
    });
  }, [socket, group?._id]);

  return (
    <div className="flex">
      {/* <Online members={group?.members} usersOnline={usersOnline!}></Online> */}
      <Chat
        groupId={group?._id!}
        groupName={group?.name!}
        messages={group?.history!}
      ></Chat>
      <button onClick={themeHandler}>toggle</button>

      {/* <Chat
        groupId={group?._id!}
        groupName={group?.name!}
        messages={group?.history!}
      ></Chat> */}

      {/* <h1>call status</h1> */}
      {/* {thisGroupCallStatus?.map((g: any) => (
        <p key={g.email} className="">
          {g.name}
        </p>
      ))}
      {thisGroupCallStatus?.length != 0 && thisGroupCallStatus != undefined ? (
        <button onClick={vidoeHandler}>Accept Call</button>
      ) : (
        <button onClick={vidoeHandler}>Start Call</button>
      )}
      <Collab groupId={group?._id!} docs={group?.docs!} />
      <GroupDrive groupId={group?._id!} files={group?.files!} /> */}
    </div>
  );
}
