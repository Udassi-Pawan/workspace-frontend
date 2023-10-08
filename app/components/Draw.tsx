"use client";
import { FC, useContext, useEffect, useState } from "react";
import { useDraw } from "@/app/hooks/useDraw";
import { ChromePicker } from "react-color";

import { drawLine } from "@/app/utils/drawLine";
import { SocketContext } from "@/app/components/SocketProvider";
import { Button } from "@/shardcn/components/ui/button";

interface pageProps {
  groupId: string;
}

type DrawLineProps = {
  prevPoint: Point | null;
  currentPoint: Point;
  color: string;
};

const Draw: FC<pageProps> = ({ groupId }) => {
  let { socket } = useContext(SocketContext);

  const [color, setColor] = useState<string>("#000");
  const { canvasRef, onMouseDown, clear } = useDraw(createLine);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!socket) return;
    console.log(socket);
    socket.emit("client-ready", {
      groupId: groupId,
    });

    socket.on("get-canvas-state", () => {
      console.log("get-canvas-state");
      if (!canvasRef.current?.toDataURL()) return;
      console.log("sending canvas state");
      socket.emit("canvas-state", {
        state: canvasRef.current.toDataURL(),
        groupId: groupId,
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
      groupId: groupId,
      prevPoint,
      currentPoint,
      color,
    });
    drawLine({ prevPoint, currentPoint, ctx, color });
  }

  return (
    <>
      <div className="mt-2  flex flex-col justify-center items-center">
        <div className="flex items-center gap-8">
          <Button
            type="button"
            className="m-2 py-1 px-3 rounded-md border border-black flex flex-col items-center"
            onClick={() => socket.emit("clear", { groupId: groupId })}
          >
            <p className="block">Clear</p>
            <p className="block">canvas</p>
          </Button>
          <ChromePicker
            className="m-2"
            color={color}
            onChange={(e) => setColor(e.hex)}
          />
        </div>
        <p className="text-left text-center text-gray-400 mt-5">
          The Canvas State is synced to the members of the group in realtime.
        </p>
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          style={{
            maxWidth: "100%", // Make it responsive on desktop
            width: "100%", // Make it responsive on desktop
          }}
          className="bg-gray-300 border border-black rounded-md m-5 h-auto"
        />
      </div>
    </>
  );
};

export default Draw;
