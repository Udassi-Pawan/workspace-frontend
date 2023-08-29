"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "./components/SocketProvider";

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Video = ({ stream }: { stream: any }) => {
  const localVideo = React.createRef<any>();

  useEffect(() => {
    if (localVideo.current) localVideo.current.srcObject = stream;
  }, [stream, localVideo]);

  return (
    <video style={{ height: 100, width: 100 }} ref={localVideo} autoPlay />
  );
};
export interface pageProps {}
export default function page({}: pageProps) {
  const [peers, setPeers] = useState<any>([]);
  const userVideo: any = useRef();
  const otherVideo: any = useRef();
  const peersRef = useRef<any>([]);
  const peersUpdated = useRef(peers);
  const setPeersUpdated = async function (data: any) {
    peersUpdated.current = [...peersUpdated.current, data];
    setPeers((users: any) => [...users, data]);
  };
  const setPeersUpdatedSingle = async function (data: any) {
    peersUpdated.current = data;
    setPeers(data);
  };
  let { socket, peer } = useContext(SocketContext);
  const [usersOnline, setUsersOnline] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);

  useEffect(() => {
    if (!socket || !peer) return;
    console.log(socket);
    console.log("peer", peer._id);
    socket!.emit("join", { peer: peer._id }, () => {});
    peer.on("call", (call: any) => {
      console.log("call", call);
      navigator.mediaDevices
        .getUserMedia({
          video: videoConstraints,
          audio: false,
        })
        .then((stream) => {
          userVideo.current!.srcObject = stream;
          call.answer(stream);
          call.on("stream", (remoteStream: any) => {
            // otherVideo.current!.srcObject = remoteStream;fa
            setPeersUpdated(remoteStream);
          });
        });
    });
    socket.on("callStatus", (callStatus: any) => {
      console.log("callStatus", callStatus);
      setIncomingCall(callStatus);
    });

    socket.on("usersOnline", (data: any) => {
      console.log(data);
      setUsersOnline((prev: any) => {
        return { ...prev, [data.groupId]: data.usersOnline };
      });
    });

    return () => {
      socket.off("callStatus");
      socket.off("usersOnline");
      peer.off("call");
    };
  }, [socket, peer]);
  console.log(usersOnline);

  const acceptHandler = async function () {
    socket.emit("acceptCall", { groupId: "64e6facf41af7c6169f50a9c" });

    navigator.mediaDevices
      .getUserMedia({
        video: videoConstraints,
        audio: false,
      })
      .then((stream: any) => {
        userVideo.current!.srcObject = stream;

        const peers: any = [];
        console.log("calling to ...", incomingCall);
        incomingCall.forEach((user: any) => {
          const call = peer.call(user.clientId, stream);
          call.on("stream", (remoteStream: any) => {
            // otherVideo.current!.srcObject = remoteStream;
            setPeersUpdated(remoteStream);
          });
        });
      });
  };

  const startHandler = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false,
    });
    userVideo.current!.srcObject = stream;
    socket.emit("startCall", { groupId: "64e6facf41af7c6169f50a9c" });
  };

  const clearHandler = async function () {
    socket.emit("clearCall", { groupId: "64e6facf41af7c6169f50a9c" }, () => {});
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 overflow-y-scroll">
      <video muted ref={userVideo} autoPlay playsInline />
      {/* <video muted ref={otherVideo} autoPlay playsInline /> */}
      {peersUpdated.current.map((stream: any, index: any) => {
        return <Video key={index} stream={stream} />;
      })}
      <button onClick={startHandler}>start video call</button>
      <button onClick={clearHandler}>clear video call</button>
      {incomingCall && (
        <button onClick={acceptHandler}>accept incoming call</button>
      )}
    </div>
  );
}
