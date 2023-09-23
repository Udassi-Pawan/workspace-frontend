import React from "react";
import Chat from "../components/Chat";

export interface pageProps {}
export default function page({}: pageProps) {
  return (
    <div className="flex">
      {/* <Chat /> */}
      <Chat />
    </div>
  );
}
