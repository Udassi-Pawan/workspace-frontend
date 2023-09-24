import React from "react";

export interface AvatarProps {
  name: string;
  classes?: string;
}
export default function Avatar({ name, classes }: AvatarProps) {
  const generateColor = (str: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-purple-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-orange-500",
    ];
    const charCodeSum = str
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = charCodeSum % colors.length;
    return colors[colorIndex];
  };
  return (
    <div
      className={`flex items-center justify-center  ${generateColor(
        name
      )} text-white rounded-full ${classes}`}
    >
      <p>{name.split(" ")[0][0] + name.split(" ")[1][0]}</p>
    </div>
  );
}
