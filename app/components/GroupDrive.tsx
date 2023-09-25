import { Button } from "@/shardcn/components/ui/button";
import { Input } from "@/shardcn/components/ui/input";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useRef } from "react";
export interface GroupDriveProps {
  groupId: string;
  files: FileType[];
}
import "./GroupDrive.css";
export default function GroupDrive({ groupId, files }: GroupDriveProps) {
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
  console.log(files);
  async function downloadHandler(filename: string, downloadFileName: string) {
    const { data } = await axios.post(
      `http://localhost:3333/files/download`,
      {
        filename,
        originalFilename: downloadFileName,
      },
      {
        headers: {
          "Authorization": `Bearer ${session?.authToken}`,
        },
      }
    );
    const anchor = document.createElement("a");
    anchor.style.display = "none";
    anchor.href = data;
    anchor.download = encodeURIComponent(downloadFileName); // You cacn specify the default file name here
    console.log(anchor);
    // Append the anchor to the document
    document.body.appendChild(anchor);

    // Trigger a click event on the anchor to initiate the download
    anchor.click();

    // Remove the anchor from the document
    document.body.removeChild(anchor);
  }
  return (
    <div className="flex flex-col items-center gap-10">
      <div className="mx-auto mt-8 flex items-center justify-center gap-5">
        <Input ref={uploadFileRef} type="file" />
        <Button onClick={uploadHandler}>Upload</Button>
      </div>{" "}
      <div className="flex flex-col items-center gap-8">
        {files?.map((f) => (
          <div
            key={f._id}
            className=" items-center mx-8 flex border border-solid border-2 border-gray-400 rounded-xl p-2"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 sm:gap-2 justify-start">
                <h2 className=" mt-10 text-wrap scroll-m-20 border-b-2 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
                  {f.name + "." + f.extension}
                </h2>
                <button
                  onClick={() =>
                    downloadHandler(
                      f._id + "." + f.extension,
                      f.name + "." + f.extension
                    )
                  }
                  className="Btn"
                >
                  <svg
                    className="svgIcon"
                    viewBox="0 0 384 512"
                    height="0.8em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
                  </svg>
                  <span className="icon2"></span>
                  <span className="tooltip">Download</span>
                </button>{" "}
              </div>
              <p className="text-primary-400"> Added by : {f.owner.name}</p>
              <p className="text-primary-400"> Uploaded on: {f.timestamp} </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
