"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";

export interface DriveProps {}
export default function Page({}: DriveProps) {
  const [user, setUser] = useState<User | null>(null);
  const { data: session } = useSession();
  const uploadFileRef = useRef<any>(null);
  const uploadHandler = async function () {
    const curFile = uploadFileRef.current.files[0];
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/s3/file`,
      {
        filetype: curFile.type,
      }
    );
    console.log(data);
    const { uploadUrl } = data;
    await axios.put(uploadUrl, curFile);
  };

  useEffect(() => {
    if (!session?.user!.email) return;
    (async function () {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/` + session?.user!.email
      );
      console.log(data);
      setUser(data);
    })();
  }, [session?.user]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 overflow-y-scroll">
      <input ref={uploadFileRef} type="file"></input>
      <button className="" onClick={uploadHandler}>
        upload
      </button>
      <div className="">
        {user?.files?.map((f) => (
          <div key={f._id} className="">
            {f.name}
          </div>
        ))}
      </div>
    </div>
  );
}
