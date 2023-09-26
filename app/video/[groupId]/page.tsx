"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../components/SocketProvider";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

// const videoConstraints = {
//   height: window.innerHeight / 2,
//   width: window.innerWidth / 2,
// };

const videoConstraints = {
  width: { min: 1280 },
  height: { min: 720 },
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
    stream.stream.getAudioTracks().forEach((videoTrack: any) => {
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
  const [streamForMediapipe, setStreamForMediapipe] =
    useState<null | MediaStream>(null);
  const [backgroundBlur, setBackgroundBlur] = useState<boolean>(false);
  const [myVideo, setMyVideo] = useState<boolean>(true);
  const [myAudio, setMyAudio] = useState<boolean>(false);
  const canvasRef = useRef<any>();
  const contextRef = useRef<any>();
  const inputVideoRef = useRef<any>();
  const { data: session } = useSession();
  const router = useRouter();
  const [myStreams, setMyStreams] = useState<any>([]);
  const myStreamsUpdated = useRef<any>(myStreams);
  const setMyStreamsUpdated = async function (data: any) {
    myStreamsUpdated.current = data;
    setMyStreams(data);
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
  async function callEverybody(video: boolean, audio: boolean) {
    if (video == false && audio == false) return;
    navigator.mediaDevices
      .getUserMedia({
        video: videoConstraints,
        audio: true,
      })
      .then((_stream: any) => {
        _stream.getAudioTracks()[0].enabled = audio;
        userVideo.current!.srcObject = _stream;
        setMyStreamsUpdated(_stream);
        thisGroupCallStatus.forEach((user: any) => {
          if (user.clientId == socket.id) return;
          const call = peer.call(user.clientId, _stream, {
            metadata: { name: session?.user!.name, returnVideo: false },
          });
        });
      });
  }
  async function stopStream() {
    try {
      let tracks = myStreamsUpdated.current.getTracks();
      tracks.forEach(function (track: any) {
        track.stop();
      });
      setMyStreamsUpdated(null);
      tracks = streamForMediapipe?.getTracks();
      tracks.forEach(function (track: any) {
        track.stop();
      });
      setStreamForMediapipe(null);
    } catch (e) {}
  }
  useEffect(() => {
    if (!socket || !peer) return;

    console.log(socket);
    console.log("peer", peer._id);
    peer.on("call", async (mediaConnection: any) => {
      console.log("call", mediaConnection);
      const _stream = myStreamsUpdated.current;
      if (mediaConnection.metadata.returnVideo) {
        userVideo.current!.srcObject = _stream;
        mediaConnection.answer(_stream);
      } else mediaConnection.answer();
      mediaConnection.on("stream", (remoteStream: any) => {
        setPeersUpdated({
          stream: remoteStream,
          metadata: mediaConnection.metadata,
        });
      });
    });

    const userOnlineHandler = ({ usersOnline, callStatus }: any) => {
      setUsersOnline(usersOnline);
      setThisGroupCallStatus(callStatus);
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
    await stopStream();
    setMyVideo(true);
    setBackgroundBlur(true);
    contextRef.current = canvasRef.current?.getContext("2d");
    navigator.mediaDevices
      .getUserMedia({
        video: videoConstraints,
        audio: false,
      })
      .then((stream) => {
        setStreamForMediapipe(stream);
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
        requestAnimationFrame(sendToMediaPipe);
      } else {
        await selfieSegmentation.send({ image: inputVideoRef.current });
        requestAnimationFrame(sendToMediaPipe);
      }
    };

    const canvasStream = canvasRef.current.captureStream();
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const combinedStream = new MediaStream();

    canvasStream.getVideoTracks().forEach((track: any) => {
      combinedStream.addTrack(track);
    });

    audioStream.getAudioTracks().forEach((track) => {
      combinedStream.addTrack(track);
    });
    userVideo.current.srcObject = combinedStream;
    setMyStreamsUpdated(combinedStream);
    combinedStream.getAudioTracks()[0].enabled = myAudio;

    thisGroupCallStatus.forEach((user: any) => {
      console.log("calling", user.clientId, "now");
      if (user.clientId != socket.id)
        peer.call(user.clientId, combinedStream, {
          metadata: { name: session?.user!.name, returnVideo: false },
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
    setMyVideo(true);
    const _stream = await navigator.mediaDevices.getUserMedia({
      video: myVideo ? videoConstraints : false,
      audio: true,
    });
    _stream.getAudioTracks()[0].enabled = myAudio;
    userVideo.current!.srcObject = _stream;
    setMyStreamsUpdated(_stream);
    socket.emit("startCall", { groupId: params.groupId });
  };

  const turnVideoOffHandler = async function () {
    setMyVideo(false);
    stopStream();
    callEverybody(false, myAudio);
  };

  async function turnVideoOnHandler() {
    setMyVideo(true);
    stopStream();
    callEverybody(true, myAudio);
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
    stopStream();
    router.push(`/group/${params.groupId}`);
  }

  async function turnAudioOffHandler() {
    setMyAudio(false);
    if (myStreamsUpdated.current)
      myStreamsUpdated.current.getAudioTracks()[0].enabled = false;
  }
  async function turnAudioOnHandler() {
    setMyAudio(true);
    if (myStreamsUpdated.current.getAudioTracks()[0])
      myStreamsUpdated.current.getAudioTracks()[0].enabled = true;
    else if (backgroundBlur) blurBackgroundHandler();
    else callEverybody(false, true);
  }
  console.log("callStatus", thisGroupCallStatus);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 overflow-y-scroll">
      <video
        className={`${myVideo ? "" : "hidden"}`}
        muted
        style={{
          height: "200px",
          width: "200px",
        }}
        ref={userVideo}
        autoPlay
        playsInline
      />
      <div className="">
        <video hidden autoPlay ref={inputVideoRef} />
        <canvas hidden ref={canvasRef} width={1280} height={720} />
      </div>
      {peersUpdated.current.map((stream: any, index: any) => {
        return <Video key={index} stream={stream} />;
      })}

      {thisGroupCallStatus &&
        !thisGroupCallStatus.find((u: any) => u.clientId == socket.id) && (
          <button onClick={acceptHandler}>Accept Call</button>
        )}

      {(!thisGroupCallStatus || thisGroupCallStatus.length == 0) && (
        <button onClick={startHandler}>Start Call</button>
      )}

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
