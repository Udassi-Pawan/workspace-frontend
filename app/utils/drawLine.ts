type DrawLineProps = Draw & {
  color: string;
};
export const drawLine = ({
  prevPoint,
  currentPoint,
  ctx,
  color,
}: DrawLineProps) => {
  const { x: currX, y: currY } = currentPoint;
  const lineColor = color;
  const lineWidth = 3; // Increase line width for a thicker line

  let startPoint = prevPoint ?? currentPoint;
  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = lineColor;

  // Set line join and cap properties for smoother lines
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(currX, currY);
  ctx.stroke();

  ctx.fillStyle = lineColor;
  ctx.beginPath();
  ctx.arc(startPoint.x, startPoint.y, lineWidth / 2, 0, 2 * Math.PI);
  ctx.fill();
};
