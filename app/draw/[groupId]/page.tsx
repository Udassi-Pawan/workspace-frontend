"use client";
import { FC, useContext, useEffect, useState } from "react";
import { useDraw } from "@/app/hooks/useDraw";
import { ChromePicker } from "react-color";

import { drawLine } from "@/app/utils/drawLine";
import { SocketContext } from "@/app/components/SocketProvider";

interface pageProps {
  params: { groupId: string };
}

type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

const page: FC<pageProps> = ({ params }) => {
  let { socket } = useContext(SocketContext);

  const [color, setColor] = useState<string>("#000");
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!socket) return;
    socket.emit("client-ready", {
      groupId: params.groupId,
    });

    socket.on("get-canvas-state", () => {
      if (!canvasRef.current?.toDataURL()) return;
      console.log("sending canvas state");
      socket.emit("canvas-state", {
        state: canvasRef.current.toDataURL(),
        groupId: params.groupId,
      });
    });

    socket.on("canvas-state-from-server", (state: string) => {
      console.log("I received the state");
      const img = new Image();
      img.src = state;
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
      };
    });

    socket.on(
      "draw-line",
      ({ prevPoint, currentPoint, color }: DrawLineProps) => {
        if (!ctx) return console.log("no ctx here");
        drawLine({ prevPoint, currentPoint, ctx, color });
      }
    );

    socket.on("clear", clear);

    return () => {
      socket.off("draw-line");
      socket.off("get-canvas-state");
      socket.off("canvas-state-from-server");
      socket.off("clear");
    };
  }, [canvasRef, socket]);

  function createLine({ prevPoint, currentPoint, ctx }: Draw) {
    socket.emit("draw-line", {
      groupId: params.groupId,
      prevPoint,
      currentPoint,
      color,
    });
    drawLine({ prevPoint, currentPoint, ctx, color });
  }

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center">
      <div className="flex flex-col gap-10 pr-10">
        <ChromePicker color={color} onChange={(e) => setColor(e.hex)} />
        <button
          type="button"
          className="p-2 rounded-md border border-black"
          onClick={() => socket.emit("clear", { groupId: params.groupId })}
        >
          Clear canvas
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        width={750}
        height={750}
        className="border border-black rounded-md"
      />
    </div>
  );
};

export default page;
