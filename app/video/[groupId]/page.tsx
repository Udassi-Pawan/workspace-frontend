"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../components/SocketProvider";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const videoConstraints = {
  height: window.innerHeight / 2,
  width: window.innerWidth / 2,
};
const displayMediaOptions = {
  video: {
    displaySurface: "window",
  },
  audio: false,
};
const Video = ({ stream }: { stream: any }) => {
  const localVideo = React.createRef<any>();
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (localVideo.current) localVideo.current.srcObject = stream.stream;
    stream.stream.getVideoTracks().forEach((videoTrack: any) => {
      videoTrack.onmute = () => {
        console.log("Frozen video stream detected!");
        setShow(false);
      };
    });
  }, [stream, localVideo]);

  return (
    <>
      {show && (
        <div className="">
          <video
            style={{ height: 100, width: 100 }}
            ref={localVideo}
            autoPlay
          />
          <p className="">{stream.metadata.name}</p>
        </div>
      )}{" "}
    </>
  );
};
export interface pageProps {}
export default function page({ params }: { params: { groupId: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [myStreams, setMyStreams] = useState<any>([]);
  const myStreamsUpdated = useRef<any>(myStreams);
  const setMyStreamsUpdated = async function (data: any) {
    myStreamsUpdated.current = [...myStreamsUpdated.current, data];
    setMyStreams((prev: any) => [...prev, data]);
  };
  const [onCall, setOnCall] = useState<any>(false);
  const [peers, setPeers] = useState<any>([]);
  const userVideo: any = useRef();
  const peersUpdated = useRef(peers);
  const setPeersUpdated = async function (data: any) {
    peersUpdated.current = [...peersUpdated.current, data];
    setPeers((users: any) => [...users, data]);
  };
  let { socket, peer } = useContext(SocketContext);
  const [usersOnline, setUsersOnline] = useState<any>(null);
  const [thisGroupCallStatus, setThisGroupCallStatus] = useState<any>(null);

  useEffect(() => {
    if (!socket || !peer) return;

    console.log(socket);
    console.log("peer", peer._id);
    peer.on("call", async (mediaConnection: any) => {
      console.log("call", mediaConnection);
      navigator.mediaDevices
        .getUserMedia({
          video: videoConstraints,
          audio: false,
        })
        .then((_stream) => {
          console.log(mediaConnection.metadata);
          if (mediaConnection.metadata.returnVideo) {
            userVideo.current!.srcObject = _stream;
            setMyStreamsUpdated(_stream);
            mediaConnection.answer(_stream);
          } else mediaConnection.answer();
          mediaConnection.on("stream", (remoteStream: any) => {
            setPeersUpdated({
              stream: remoteStream,
              metadata: mediaConnection.metadata,
            });
          });
        });
    });

    const userOnlineHandler = ({ usersOnline, callStatus }: any) => {
      setUsersOnline(usersOnline);
      setThisGroupCallStatus(callStatus);
      console.log("callStatus", callStatus);
      console.log("usersOnline", usersOnline);
    };

    socket.emit("usersOnline", { groupId: params.groupId }, userOnlineHandler);
    socket.on(`usersOnline${params.groupId}`, userOnlineHandler);
    socket.on(`callStatus${params.groupId}`, (_callStatus: any) => {
      console.log("received callstatus", _callStatus);
      setThisGroupCallStatus(_callStatus);
    });

    return () => {
      socket.off(`callStatus${params.groupId}`);
      socket.off(`usersOnline${params.groupId}`);
      peer.off("call");
    };
  }, [socket, peer]);

  const acceptHandler = async function () {
    socket.emit("acceptCall", { groupId: params.groupId });
    navigator.mediaDevices
      .getUserMedia({
        video: videoConstraints,
        audio: false,
      })
      .then((_stream: any) => {
        userVideo.current!.srcObject = _stream;
        setMyStreamsUpdated(_stream);
        console.log("calling to ...", thisGroupCallStatus);
        thisGroupCallStatus.forEach((user: any) => {
          console.log("calling", user.clientId, "now");
          const call = peer.call(user.clientId, _stream, {
            metadata: { name: session?.user!.name, returnVideo: true },
          });
          setOnCall(call);
          call.on("stream", (remoteStream: any) => {
            setPeersUpdated({
              stream: remoteStream,
              metadata: { name: user.name },
            });
          });
        });
      });
  };

  const startHandler = async () => {
    setOnCall(true);

    const _stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false,
    });
    userVideo.current!.srcObject = _stream;
    setMyStreamsUpdated(_stream);
    socket.emit("startCall", { groupId: params.groupId });
  };

  const turnVideoOffHandler = async function () {
    myStreamsUpdated.current.forEach(async (_stream: any) => {
      await _stream.getTracks().forEach((track: any) => track.stop());
    });
    setMyStreamsUpdated([]);
  };

  async function turnVideoOnHandler() {
    const _stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false,
    });
    userVideo.current!.srcObject = _stream;
    setMyStreamsUpdated(_stream);
    thisGroupCallStatus.forEach((user: any) => {
      console.log("calling", user.clientId, "now");
      if (user.clientId == socket.id) return;
      peer.call(user.clientId, _stream, {
        metadata: { name: session?.user!.name, returnVideo: false },
      });
    });
  }
  async function shareScreenHandler() {
    const screenStream = await navigator.mediaDevices.getDisplayMedia(
      displayMediaOptions
    );
    thisGroupCallStatus.forEach((user: any) => {
      console.log("calling", user.clientId, "now");
      if (user.clientId == socket.id) return;
      const call = peer.call(user.clientId, screenStream, {
        metadata: { name: session?.user!.name, returnVideo: false },
      });
    });
  }

  async function endHandler() {
    socket.emit(`endCall`, { groupId: params.groupId });
    turnVideoOffHandler();
    router.push(`/group/${params.groupId}`);
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 overflow-y-scroll">
      <video muted ref={userVideo} autoPlay playsInline />
      {peersUpdated.current.map((stream: any, index: any) => {
        return <Video key={index} stream={stream} />;
      })}
      {!onCall &&
      thisGroupCallStatus?.length != 0 &&
      thisGroupCallStatus != undefined ? (
        <button onClick={acceptHandler}>Accept Call</button>
      ) : (
        <button onClick={startHandler}>Start Call</button>
      )}
      {onCall && <button onClick={turnVideoOffHandler}>turn video off</button>}
      <button onClick={turnVideoOnHandler}> turn video on </button>
      <button onClick={shareScreenHandler}> share Screen </button>
      <button onClick={endHandler}> end call </button>
    </div>
  );
}
