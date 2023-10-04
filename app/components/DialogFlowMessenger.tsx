"use client";
import { useSession } from "next-auth/react";

function DialogflowMessenger() {
  const { data: session } = useSession();
  // return null;
  if (session)
    return (
      <div>
        <df-messenger
          user-id={session?.authToken}
          intent="WELCOME"
          chat-title="workspace-bot"
          agent-id="64aa82c8-b1b7-49f2-9d7b-7d40fad0d251"
          language-code="en"
        ></df-messenger>
      </div>
    );
  else return null;
}
export default DialogflowMessenger;
