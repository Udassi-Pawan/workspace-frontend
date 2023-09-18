import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

const onResults = (results: any, contextRef: any, canvasRef: any) => {
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

async function getCanvas(inputVideoRef: any, contextRef: any, canvasRef: any) {
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

  selfieSegmentation.onResults((results) =>
    onResults(results, contextRef, canvasRef)
  );

  const sendToMediaPipe = async () => {
    if (!inputVideoRef.current.videoWidth) {
      console.log(inputVideoRef.current.videoWidth);
      requestAnimationFrame(sendToMediaPipe);
    } else {
      await selfieSegmentation.send({ image: inputVideoRef.current });
      requestAnimationFrame(sendToMediaPipe);
    }
  };
  return;
}

export default getCanvas;
