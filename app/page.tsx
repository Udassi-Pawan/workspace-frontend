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
  const { data } = useSession();
  useEffect(() => {
    if (!socket) return;
    console.log(socket);
    navigator.mediaDevices
      .getUserMedia({ video: videoConstraints, audio: true })
      .then((stream) => {
        userVideo.current!.srcObject = stream;
        socket!.emit("join room", roomID);
        socket!.on("all users", (users: any) => {
          const peers: any = [];
          users.forEach((userID: any) => {
            const peer = createPeer(userID, socket.id, stream);
            peersRef.current.push({
              peerID: userID,
              peer,
            });
            peers.push(peer);
          });
          setPeers(peers);
        });

        socket.on("user joined", (payload: any) => {
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({
            peerID: payload.callerID,
            peer,
          });

          setPeers((users: any) => [...users, peer]);
        });

        socket.on("receiving returned signal", (payload: any) => {
          const item = peersRef.current.find(
            (p: any) => p.peerID === payload.id
          );
          item.peer.signal(payload.signal);
        });
      });
  }, [socket]);

  function createPeer(userToSignal: any, callerID: any, stream: any) {
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

  return (
    <div>
      <video muted ref={userVideo} autoPlay playsInline />
      {peers.map((peer: any, index: any) => {
        return <Video key={index} peer={peer} />;
      })}
    </div>
  );
}
