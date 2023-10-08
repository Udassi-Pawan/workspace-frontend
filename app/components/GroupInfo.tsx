import React, { useContext, useEffect } from "react";
import { SocketContext } from "./SocketProvider";
import Avatar from "./Avatar";
import axios from "axios";
import { useSession } from "next-auth/react";
import ScrollableFeed from "react-scrollable-feed";
import { SpinnerContext } from "./SpinnerProvider";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export interface OnlineProps {
  members: any;
  usersOnline: User[];
  groupId: string;
}

export default function GroupInfo({
  members,
  usersOnline,
  groupId,
}: OnlineProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { setLoading } = useContext(SpinnerContext);
  const leaveGroupHandler = async function () {
    setLoading(true);
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/leave`,
      {
        groupId,
      },
      {
        headers: {
          "Authorization": `Bearer ${session?.authToken}`,
        },
      }
    );
    setLoading(false);
    toast.success("Group left");
    router.push("/");
  };
  return (
    <div className="border-l border-gray-300 hidden md:block pl-2 mx-1 flex flex-col items-center">
      <h1 className="ml-7 mt-10 text-2xl">Members</h1>
      <div className="mt-5 h-[55vh] md:h-[65vh] ">
        <ScrollableFeed className="space-y-4">
          {members?.map((m: User) => (
            <div key={m._id} className="flex items-center gap-1">
              <Avatar classes="w-12 h-12" name={m.name} />
              <div>
                <p>{m.name}</p>
                <p className="text-blue-300 ">
                  {usersOnline?.find((u) => u.email == m.email) ? "online" : ""}
                </p>
              </div>
            </div>
          ))}
        </ScrollableFeed>
      </div>
      <button
        onClick={leaveGroupHandler}
        className="ml-3 mt-8 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold py-2 px-4 rounded-full shadow-lg transform transition-all duration-500 ease-in-out hover:scale-110 hover:brightness-110 hover:animate-pulse active:animate-bounce"
      >
        Leave Group
      </button>
    </div>
  );
}
