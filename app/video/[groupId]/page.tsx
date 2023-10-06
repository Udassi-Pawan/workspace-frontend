"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../../components/SocketProvider";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import { Button } from "@/shardcn/components/ui/button";
import Avatar from "@/app/components/Avatar";
import Image from "next/image";

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
        <div className="flex flex-col items-center justify-center ">
          <div
            style={{
              borderRadius: "10px",
              overflow: "hidden",
              zIndex: "1",
              // height: "200px",
              // width: "300px",
            }}
            className="w-2/3 sm:w-4/5 md:w-96  xl:w-200"
          >
            <video
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
              }}
              ref={localVideo}
              autoPlay
            />
          </div>

          <p className="">{stream.metadata.name}</p>
        </div>
      )}{" "}
    </>
  );
};
export interface pageProps {}
export default function Page({ params }: { params: { groupId: string } }) {
  const [myNavigator, setMyNavigator] = useState<any>(null);
  useEffect(() => {
    if (typeof window !== undefined) setMyNavigator(window.navigator);
  }, [typeof window]);

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
    myNavigator.mediaDevices
      .getUserMedia({
        video: video && videoConstraints,
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
    console.log("getting users :");
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
  }, [socket?.id, peer]);

  const acceptHandler = async function () {
    setOnCall(true);
    socket.emit("acceptCall", { groupId: params.groupId });
    myNavigator.mediaDevices
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
          call.on("stream", (remoteStream: any) => {
            console.log("stream received", remoteStream);
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
    myNavigator.mediaDevices
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
      if (!inputVideoRef.current?.videoWidth) {
        requestAnimationFrame(sendToMediaPipe);
      } else {
        await selfieSegmentation.send({ image: inputVideoRef.current });
        requestAnimationFrame(sendToMediaPipe);
      }
    };

    const canvasStream = canvasRef.current.captureStream();
    const audioStream = await myNavigator.mediaDevices.getUserMedia({
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
    const _stream = await myNavigator.mediaDevices.getUserMedia({
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
    setBackgroundBlur(false);
    stopStream();
    callEverybody(false, myAudio);
  };

  async function turnVideoOnHandler() {
    setMyVideo(true);
    stopStream();
    callEverybody(true, myAudio);
  }
  async function shareScreenHandler() {
    const screenStream = await myNavigator.mediaDevices.getDisplayMedia(
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
    <React.Suspense fallback={<h1>Wait</h1>}>
      <div className="flex flex-col items-center justify-center h-screen gap-5 overflow-y-scroll">
        <div className="">
          <video hidden autoPlay ref={inputVideoRef} />
          <canvas hidden ref={canvasRef} width={1280} height={720} />
        </div>

        <div className="flex flex-wrap gap-5 items-center justify-center">
          {peersUpdated.current.map((stream: any, index: any) => {
            return <Video key={index} stream={stream} />;
          })}
        </div>

        {!onCall && thisGroupCallStatus && thisGroupCallStatus.length != 0 && (
          <div className="flex items-center flex-col gap-5">
            <p className="text-xl text-bold">In call</p>
            <div className="flex flex-col  gap-4 ">
              {thisGroupCallStatus?.map((m: User) => (
                <div key={m.email} className="flex items-center gap-1">
                  <Avatar classes="w-12 h-12" name={m.name} />
                  <div>
                    <p>{m.name}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={acceptHandler}>Accept Call</Button>
          </div>
        )}

        {!onCall &&
          (!thisGroupCallStatus || thisGroupCallStatus.length == 0) && (
            <div className="flex flex-col items-center gap-5">
              <p className="text-xl text-bold">Users Online</p>
              {usersOnline?.map((m: User) => (
                <div key={m.email} className="w-full flex items-center gap-1">
                  <Avatar classes="w-12 h-12" name={m.name} />
                  <div>
                    <p>{m.name}</p>
                  </div>
                </div>
              ))}
              <Button onClick={startHandler}>Start Call</Button>
            </div>
          )}
        {onCall && (
          <>
            <div className="w-full sm:flex-row flex-col flex gap-5 items-center justify-center">
              <video
                className={`${
                  myVideo ? "" : "hidden"
                } rounded-full shadow-lg  w-full h-full object-cover `}
                muted
                style={{
                  height: "150px",
                  width: "150px",
                }}
                ref={userVideo}
                autoPlay
                playsInline
              />
              <div className="flex items-center gap-5 flex-wrap justify-center">
                {!myVideo ? (
                  <Button
                    className="bg-red-500 rounded-full hover:bg-red-400"
                    onClick={turnVideoOnHandler}
                  >
                    <Image
                      src={"/video-off.png"}
                      alt=""
                      width="30"
                      height="30"
                      style={{ filter: "brightness(0) invert(1)" }}
                    ></Image>
                  </Button>
                ) : (
                  <Button
                    className="bg-blue-500 rounded-full hover:bg-blue-400"
                    onClick={turnVideoOffHandler}
                  >
                    <Image
                      src={"/video-on.png"}
                      alt=""
                      width="30"
                      height="30"
                      style={{ filter: "brightness(0) invert(1)" }}
                    ></Image>{" "}
                  </Button>
                )}
                {!myAudio ? (
                  <Button
                    className="bg-red-500 rounded-full hover:bg-red-400"
                    onClick={turnAudioOnHandler}
                  >
                    <Image
                      src={"/mic-off.png"}
                      alt=""
                      width="30"
                      height="30"
                      style={{ filter: "brightness(0) invert(1)" }}
                    ></Image>{" "}
                  </Button>
                ) : (
                  <Button
                    className="bg-blue-500 rounded-full hover:bg-blue-400"
                    onClick={turnAudioOffHandler}
                  >
                    <Image
                      src={"/mic-on.png"}
                      alt=""
                      width="30"
                      height="30"
                      style={{ filter: "brightness(0) invert(1)" }}
                    ></Image>{" "}
                  </Button>
                )}
                {myVideo && !backgroundBlur && (
                  <Button
                    className="hidden sm:flex bg-blue-500 rounded-full hover:bg-blue-400"
                    onClick={blurBackgroundHandler}
                  >
                    <Image
                      src={"/background-remove.png"}
                      alt=""
                      width="30"
                      height="30"
                      style={{ filter: "brightness(0) invert(1)" }}
                    ></Image>{" "}
                  </Button>
                )}
                <Button
                  className="hidden sm:flex bg-gray-600 rounded-full hover:bg-gray-500"
                  onClick={shareScreenHandler}
                >
                  {" "}
                  <Image
                    src={"/share-screen.png"}
                    alt=""
                    width="30"
                    height="30"
                    style={{ filter: "brightness(0) invert(1)" }}
                  ></Image>{" "}
                </Button>

                <Button
                  className="bg-red-500 rounded-full hover:bg-red-400 px-8"
                  onClick={endHandler}
                >
                  <Image
                    src={"/end-call.png"}
                    alt=""
                    width="30"
                    height="30"
                    style={{ filter: "brightness(0) invert(1)" }}
                  ></Image>{" "}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </React.Suspense>
  );
}
