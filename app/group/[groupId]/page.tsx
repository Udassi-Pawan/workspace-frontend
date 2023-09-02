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

  const userOnlineHandler = ({ usersOnline, callStatus }: any) => {
    setUsersOnline(usersOnline);
    setThisGroupCallStatus(callStatus);
    console.log("callStatus", callStatus);
  };

  useEffect(() => {
    if (!group) return;
    socket.emit("usersOnline", { groupId: params.groupId }, userOnlineHandler);
    socket.on(`usersOnline${group?._id}`, userOnlineHandler);
    socket.on(`callStatus${group?._id}`, (_callStatus: any) => {
      console.log("received callstatus", _callStatus);
      setThisGroupCallStatus(_callStatus);
    });
  }, [socket, group?._id]);

  const acceptHandler = async function () {};
  const startHandler = async function () {};

  return (
    <div className="">
      <Online members={group?.members} usersOnline={usersOnline!}></Online>
      <Chat groupId={group?._id!} _chatHistory={group?.history!}></Chat>
      <h1>call status</h1>
      {thisGroupCallStatus?.map((g: any) => (
        <p key={g.email} className="">
          {g.name}
        </p>
      ))}
      {JSON.stringify(thisGroupCallStatus) != "{}" &&
        thisGroupCallStatus != undefined && <button>Accept Call</button>}
    </div>
  );
}
