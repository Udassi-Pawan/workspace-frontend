"use client";
import axios from "axios";
import { SocketContext } from "@/app/components/SocketProvider";
import { useContext, useEffect, useState } from "react";
import Online from "@/app/components/Online";
import Chat from "@/app/components/Chat";

export default function Page({ params }: { params: { groupId: string } }) {
  let { socket } = useContext(SocketContext);
  const [group, setGroup] = useState<Group | null>(null);
  const [usersOnline, setUsersOnline] = useState<User[] | null>(null);

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

  const userOnlineHandler = (_usersOnline: any) => {
    setUsersOnline(_usersOnline.usersOnline);
  };

  useEffect(() => {
    if (!group) return;
    socket.emit("usersOnline", { groupId: params.groupId }, userOnlineHandler);
    socket.on(`usersOnline${group?._id}`, userOnlineHandler);
  }, [socket, group?._id]);

  return (
    <div className="">
      <Online members={group?.members} usersOnline={usersOnline!}></Online>
      <Chat groupId={group?._id!} _chatHistory={group?.history!}></Chat>
    </div>
  );
}
