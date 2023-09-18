"use client";
import { useEffect, useRef } from "react";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import getCanvas from "../components/Canvas";

function App() {
  const inputVideoRef = useRef<any>();
  const remVideoRef = useRef<any>();
  const canvasRef = useRef<any>();
  const contextRef = useRef<any>();

  useEffect(() => {
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
    remVideoRef.current.srcObject = canvasStream;
  }, []);

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

  useEffect(() => {
    // const canvasStream = canvasRef.current.captureStream();
    // remVideoRef.current.srcObject = canvasStream;
  }, []);

  return (
    <div className="App">
      <video autoPlay ref={remVideoRef} />
      <video autoPlay ref={inputVideoRef} />
      <canvas ref={canvasRef} width={1280} height={720} />
    </div>
  );
}

export default App;
