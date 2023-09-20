"use client";

import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

function DialogflowMessenger() {
  const { data: session } = useSession();
  console.log(session);
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
    script.async = true;
    document.body.appendChild(script);
  }, []);
  console.log(session?.authToken);
  return (
    // <h1></h1>
    <df-messenger
      user-id={session?.authToken}
      intent="WELCOME"
      chat-title="workspace-bot"
      agent-id="64aa82c8-b1b7-49f2-9d7b-7d40fad0d251"
      language-code="en"
    ></df-messenger>
  );
}
export default DialogflowMessenger;
