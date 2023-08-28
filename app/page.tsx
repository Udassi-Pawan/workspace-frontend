"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { SocketContext } from "./components/SocketProvider";
import { useSession } from "next-auth/react";

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};

const Video = (props: any) => {
  const ref = useRef<any>();

  useEffect(() => {
    props.peer.on("stream", (stream: any) => {
      ref.current!.srcObject = stream;
    });
  }, []);

  return <video autoPlay ref={ref} />;
};

export interface pageProps {}
export default function page({}: pageProps) {
  const [peers, setPeers] = useState<any>([]);
  const userVideo: any = useRef();
  const peersRef = useRef<any>([]);
  const roomID = "abcd";
  let { socket } = useContext(SocketContext);
  const [usersOnline, setUsersOnline] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  async function getStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false,
    });
    return stream;
  }

  useEffect(() => {
    if (!socket) return;
    console.log(socket);

    socket!.emit("join", {}, () => {});

    socket?.on("usersOnline", (data: any) => {
      console.log(data);
      setUsersOnline((prev: any) => {
        return { ...prev, [data.groupId]: data.usersOnline };
      });
    });
    socket!.on("all users", (users: any) => {});
    let stream: any;
    (async function () {
      stream = await getStream();
    })();

    socket.on("user joined", (payload: any) => {
      console.log("user joined", payload);
      setIncomingCall(payload);
      return;
      const peer = addPeer(payload.signal, payload.callerID, stream);
      peersRef.current.push({
        peerID: payload.callerID,
        peer,
      });

      setPeers((users: any) => [...users, peer]);
    });

    socket.on("receiving returned signal", (payload: any) => {
      const item = peersRef.current.find((p: any) => p.peerID === payload.id);
      console.log("receiving returned signal", payload);
      console.log("item", item);
      console.log("payload", payload);
      console.log("peerrefs", peersRef);
      item.peer.signal(payload.signal);
    });
  }, [socket]);
  console.log(usersOnline);

  function createPeer(userToSignal: any, callerID: any, stream: any) {
    console.log("sending signal to caller id ", userToSignal);
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal: any, callerID: any, stream: any) {
    userVideo.current!.srcObject = stream;
    console.log("returning signal ", callerID);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (signal) => {
      socket.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }
  const acceptHandler = async function () {
    const payload = incomingCall;

    const stream = await getStream();
    userVideo.current!.srcObject = stream;
    const peer = addPeer(payload.signal, payload.callerID, stream);
    peersRef.current.push({
      peerID: payload.callerID,
      peer,
    });

    setPeers((users: any) => [...users, peer]);
  };

  const startHandler = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: true,
    });
    userVideo.current!.srcObject = stream;
    // socket!.emit("join room", roomID);
    const peers: any = [];
    usersOnline["64e6facf41af7c6169f50a9c"].forEach((user: any) => {
      if (user.clientId == socket.id) return;
      const peer = createPeer(user.clientId, socket.id, stream);
      peersRef.current.push({
        peerID: user.clientId,
        peer,
      });
      peers.push(peer);
    });
    setPeers(peers);
  };

  return (
    <div>
      <video muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer: any, index: any) => {
        return <Video key={index} peer={peer} />;
      })}
      <button onClick={startHandler}>start video call</button>
      {incomingCall && (
        <button onClick={acceptHandler}>accept incoming call</button>
      )}
    </div>
  );
}
