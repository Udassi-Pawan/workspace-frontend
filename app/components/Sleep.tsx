import React from "react";

export interface SleepProps {}
export default function Sleep({}: SleepProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[100vh] gap-5">
      <h1 className="text-xl text-center">
        The Backend Server is in sleep mode
      </h1>
      <h1 className="text-3xl font-bold text-center">
        Please reload a few times to access the site
      </h1>
    </div>
  );
}
