"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../components/SocketProvider";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

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
  const [myAudio, setMyAudio] = useState<boolean>(false);
  const canvasRef = useRef<any>();
  const contextRef = useRef<any>();
  const inputVideoRef = useRef<any>();
  const [showUserVideo, setShowUserVideo] = useState<boolean>(false);
  const { data: session } = useSession();
  const router = useRouter();
  const [myStreams, setMyStreams] = useState<any>([]);
  const myStreamsUpdated = useRef<any>(myStreams);
  const setMyStreamsUpdated = async function (data: any) {
    myStreamsUpdated.current = [...myStreamsUpdated.current, data];
    setMyStreams((prev: any) => [...prev, data]);
    myStreamsUpdated.current = [data];
    setMyStreams([data]);
  };
  const [onCall, setOnCall] = useState<any>(false);
  const [peers, setPeers] = useState<any>([]);
  const userVideo: any = useRef();
  const peersUpdated = useRef(peers);
  const setPeersUpdated = async function (data: any) {
    console.log("receieved peer update", data);
    if (peersUpdated.current.find((el: any) => el.stream.id == data.stream.id))
      return;
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
          audio: true,
        })
        .then((_stream) => {
          _stream.getAudioTracks()[0].enabled = myAudio;
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
    setShowUserVideo(true);
    socket.emit("acceptCall", { groupId: params.groupId });
    navigator.mediaDevices
      .getUserMedia({
        video: videoConstraints,
        audio: true,
      })
      .then((_stream: any) => {
        _stream.getAudioTracks()[0].enabled = myAudio;
        userVideo.current!.srcObject = _stream;
        setMyStreamsUpdated(_stream);
        console.log("calling to ...", thisGroupCallStatus);
        thisGroupCallStatus.forEach((user: any) => {
          console.log("calling", user.clientId, "now");
          const call = peer.call(user.clientId, _stream, {
            metadata: { name: session?.user!.name, returnVideo: true },
          });
          setOnCall(true);
          call.on("stream", (remoteStream: any) => {
            setPeersUpdated({
              stream: remoteStream,
              metadata: { name: user.name },
            });
          });
        });
      });
  };

  const blurBackgroundHandler = async function () {
    turnVideoOffHandler();
    setShowUserVideo(true);
    contextRef.current = canvasRef.current?.getContext("2d");
    const constraints = {
      video: { width: { min: 1280 }, height: { min: 720 } },
    };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      inputVideoRef.current.srcObject = stream;
      sendToMediaPipe();
    });

    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: false,
    });

    selfieSegmentation.onResults(onResults);

    const sendToMediaPipe = async () => {
      if (!inputVideoRef.current.videoWidth) {
        console.log(inputVideoRef.current.videoWidth);
        requestAnimationFrame(sendToMediaPipe);
      } else {
        await selfieSegmentation.send({ image: inputVideoRef.current });
        requestAnimationFrame(sendToMediaPipe);
      }
    };

    const canvasStream = canvasRef.current.captureStream();
    userVideo.current.srcObject = canvasStream;
    setMyStreamsUpdated(canvasStream);

    thisGroupCallStatus.forEach((user: any) => {
      console.log("calling", user.clientId, "now");
      const call = peer.call(user.clientId, canvasStream, {
        metadata: { name: session?.user!.name, returnVideo: false },
      });
      setOnCall(call);
      call.on("stream", (remoteStream: any) => {
        setPeersUpdated({
          stream: remoteStream,
          metadata: { name: user.name },
        });
      });
    });
  };
  const onResults = (results: any) => {
    contextRef.current.save();
    contextRef.current.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    contextRef.current.drawImage(
      results.segmentationMask,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    // Only overwrite existing pixels.
    contextRef.current.globalCompositeOperation = "source-out";
    contextRef.current.fillStyle = "#000923";
    // contextRef.current.fillStyle = "#00FF06";
    contextRef.current.fillRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // Only overwrite missing pixels.
    contextRef.current.globalCompositeOperation = "destination-atop";
    contextRef.current.drawImage(
      results.image,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    contextRef.current.restore();
    // console.log(canvasStream);
  };

  const startHandler = async () => {
    setOnCall(true);
    setShowUserVideo(true);
    const _stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: true,
    });
    _stream.getAudioTracks()[0].enabled = myAudio;
    userVideo.current!.srcObject = _stream;
    setMyStreamsUpdated(_stream);
    socket.emit("startCall", { groupId: params.groupId });
  };

  const turnVideoOffHandler = async function () {
    myStreamsUpdated.current.forEach(async (_stream: any) => {
      await _stream.getTracks().forEach((track: any) => track.stop());
    });
    setMyStreamsUpdated([]);
    setShowUserVideo(false);
  };

  async function turnVideoOnHandler() {
    setShowUserVideo(true);
    const _stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: true,
    });
    _stream.getAudioTracks()[0].enabled = myAudio;
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
    setOnCall(false);
    socket.emit(`endCall`, { groupId: params.groupId });
    turnVideoOffHandler();
    router.push(`/group/${params.groupId}`);
  }

  async function turnAudioOffHandler() {
    setMyAudio(false);
    myStreamsUpdated.current[0].getAudioTracks()[0].enabled = false;
  }
  async function turnAudioOnHandler() {
    setMyAudio(true);
    myStreamsUpdated.current[0].getAudioTracks()[0].enabled = true;
  }
  console.log("peers", peersUpdated.current);
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 overflow-y-scroll">
      {showUserVideo && <video muted ref={userVideo} autoPlay playsInline />}
      <div className="">
        <video hidden autoPlay ref={inputVideoRef} />
        <canvas hidden ref={canvasRef} width={1280} height={720} />
      </div>
      {peersUpdated.current.map((stream: any, index: any) => {
        return <Video key={index} stream={stream} />;
      })}
      {/* {!onCall &&
      thisGroupCallStatus != undefined &&
      thisGroupCallStatus[params.groupId]?.length != 0 ? ( */}
      <div className="">
        <button onClick={acceptHandler}>Accept Call</button>
      </div>
      {/* ) : ( */}
      <button onClick={startHandler}>Start Call</button>
      {/* )} */}
      {onCall && <button onClick={turnVideoOffHandler}>turn video off</button>}
      <button onClick={blurBackgroundHandler}>turn on blur background</button>

      <button onClick={turnVideoOnHandler}> turn video on </button>
      <button onClick={shareScreenHandler}> share Screen </button>
      <button onClick={endHandler}> end call </button>
      <button onClick={turnAudioOffHandler}>turn audio off</button>
      <button onClick={turnAudioOnHandler}>turn audio on</button>
    </div>
  );
}
