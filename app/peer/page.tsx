"use client";

import React, { useContext, useEffect, useRef, useState } from "react";

import { Peer } from "peerjs";
import { SocketContext } from "../components/SocketProvider";

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

export interface pageProps {}
export default function page({}: pageProps) {
  const userVideo: any = useRef();
  const otherVideo: any = useRef();
  const other2Video: any = useRef();
  let { socket, peer } = useContext(SocketContext);

  const [usersOnline, setUsersOnline] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  const otherPeerId = useRef<any>(null);
  useEffect(() => {
    if (!socket || !peer) return;
    console.log(socket);
    console.log("peer", peer);
    console.log("peerid", peer._id);
    socket!.emit("join", { peer: peer._id }, () => {});

    socket.on("callStatus", (callStatus: any) => {
      setIncomingCall(callStatus);
    });

    socket.on("usersOnline", (data: any) => {
      setUsersOnline((prev: any) => {
        return { ...prev, [data.groupId]: data.usersOnline };
      });
    });

    peer.on("call", (call: any) => {
      navigator.mediaDevices
        .getUserMedia({
          video: videoConstraints,
          audio: false,
        })
        .then((stream) => {
          userVideo.current!.srcObject = stream;

          call.answer(stream);
          call.on("stream", (remoteStream: any) => {
            otherVideo.current!.srcObject = remoteStream;
          });
        });
    });
  }, [socket, peer, peer?._id]);
  console.log(incomingCall);
  console.log(usersOnline);

  const startHandler = async () => {
    navigator.mediaDevices
      .getUserMedia({
        video: videoConstraints,
        audio: true,
      })
      .then((stream: any) => {
        userVideo.current!.srcObject = stream;

        const call: any = peer.call(otherPeerId.current.value, stream);
        call.on("stream", (remoteStream: any) => {
          otherVideo.current!.srcObject = remoteStream;
        });
      });
  };
  const start2Handler = async () => {
    navigator.mediaDevices
      .getUserMedia({
        video: videoConstraints,
        audio: true,
      })
      .then((stream: any) => {
        userVideo.current!.srcObject = stream;

        const call: any = peer.call(otherPeerId.current.value, stream);
        call.on("stream", (remoteStream: any) => {
          other2Video.current!.srcObject = remoteStream;
        });
      });
  };

  return (
    <>
      <input ref={otherPeerId} placeholder="other peer id"></input>
      <video muted ref={userVideo} autoPlay playsInline />
      <video muted ref={otherVideo} autoPlay playsInline />
      <video muted ref={other2Video} autoPlay playsInline />
      <button onClick={startHandler}>start</button>
      <button onClick={start2Handler}>start2</button>
    </>
  );
}
