import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useRef, useState } from "react";

export interface GroupDriveProps {
  groupId: string;
  files: FileType[];
}
export default function GroupDrive({ groupId, files }: GroupDriveProps) {
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { data: session } = useSession();
  const uploadFileRef = useRef<any>(null);
  const uploadHandler = async function () {
    const curFile = uploadFileRef.current.files[0];
    const { data } = await axios.post(
      "http://localhost:3333/files/create",
      {
        filetype: curFile.type,
        groups: [groupId],
        name: curFile.name.split(".")[0],
      },
      {
        headers: {
          "Authorization": `Bearer ${session?.authToken}`,
        },
      }
    );
    console.log(data);
    const { uploadUrl } = data;
    await axios.put(uploadUrl, curFile);
  };

  const downloadHandler = async function (
    fileId: string,
    fileExtension: string
  ) {
    const { data } = await axios.post(
      `http://localhost:3333/files/download`,
      {
        filename: `${fileId}.${fileExtension}`,
      },
      {
        headers: {
          "Authorization": `Bearer ${session?.authToken}`,
        },
      }
    );
    console.log(data);
    setVideoLink(data);
    setTimeout(() => {
      videoRef.current?.load();
      videoRef.current?.play();
    }, 200);
  };

  return (
    <div>
      <input ref={uploadFileRef} type="file"></input>
      <button className="" onClick={uploadHandler}>
        upload
      </button>
      <div className="">
        {files?.map((f) => (
          <div key={f._id} className="">
            <p className=""> {f.name + "." + f.extension} </p>
            <button onClick={() => downloadHandler(f._id, f.extension)}>
              download
            </button>
          </div>
        ))}
        <video
          ref={videoRef}
          width={"320"}
          height={"240"}
          controls
          // preload="auto"
        >
          <source src={videoLink!} type={"video/mp4"}></source>
        </video>
      </div>
    </div>
  );
}
