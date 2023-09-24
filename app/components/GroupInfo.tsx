import React, { useContext, useEffect } from "react";
import { SocketContext } from "./SocketProvider";
import Avatar from "./Avatar";

export interface OnlineProps {
  members: any;
  usersOnline: User[];
}

export default function GroupInfo({ members, usersOnline }: OnlineProps) {
  let { socket } = useContext(SocketContext);
  return (
    <div className="border-l-2 hidden md:block  px-2 flex flex-col items-center">
      <div className=" border-b-2 w-full">
        <h1 className="py-3.5 my-4 text-2xl">Members</h1>
      </div>
      <div className="flex flex-col  gap-4 mt-4">
        {members?.map((m: User) => (
          <div key={m._id} className="flex items-center gap-1">
            <Avatar classes="w-12 h-12" name={m.name} />
            <div>
              <p>{m.name}</p>
              <p className="text-blue-300 ">
                {usersOnline?.find((u) => u.email == m.email) ? "online" : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
