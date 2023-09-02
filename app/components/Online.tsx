import React, { useContext, useEffect } from "react";
import { SocketContext } from "./SocketProvider";

export interface OnlineProps {
  members: any;
  usersOnline: User[];
}
export default function Online({ members, usersOnline }: OnlineProps) {
  let { socket } = useContext(SocketContext);
  return (
    <div>
      {members?.map((m: User) => (
        <p key={m._id} className="">
          {" "}
          {m.name} {usersOnline?.find((u) => u.email == m.email) ? "*" : ""}
        </p>
      ))}
    </div>
  );
}
