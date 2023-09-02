"use client";

import { SocketContext } from "@/app/components/SocketProvider";
import { useContext, useEffect } from "react";

export default function Page({ params }: { params: { groupId: string } }) {
  let { socket } = useContext(SocketContext);

  useEffect(() => {}, []);

  return <p>Post: {params.groupId}</p>;
}
