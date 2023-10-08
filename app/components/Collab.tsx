import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";
import Link from "next/link";
import { Button } from "@/shardcn/components/ui/button";
import { Input } from "@/shardcn/components/ui/input";
import { SpinnerContext } from "./SpinnerProvider";
import { toast } from "react-toastify";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");
export default function Collab({
  docs,
  groupId,
}: {
  docs: Doc[];
  groupId: string;
}) {
  const { setLoading } = useContext(SpinnerContext);
  const docName = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const createHandler = async function () {
    setLoading(true);
    const req = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/doc/create`,
      {
        groupId,
        name: docName.current!.value,
      }
    );
    setLoading();
    toast.success("Document Created.");
    router.push(`/collab/${req.data._id}`);
  };
  return (
    <>
      <div className="flex flex-col items-center gap-10 mt-20">
        <div className="flex items-center text-center flex-col gap-2">
          <h2>Documents are automatically synced and saved in realtime.</h2>
          <h2>
            Collab Cursor shows the changes being made by other users at the
            moment.
          </h2>
        </div>
        <div className="flex justify-center m-2 gap-5 flex-wrap">
          {docs?.map((d) =>
            d ? (
              <div
                onClick={() => {
                  toast.info(
                    "Please wait a few moments for the document to load"
                  );
                }}
                key={d._id}
                className=""
              >
                <Link key={d._id} href={"/collab/" + d._id}>
                  <div className="relative inline-block px-4 py-2 font-medium group">
                    <span className="absolute inset-0 w-full h-full transition duration-200 ease-out transform translate-x-1 translate-y-1 bg-black group-hover:-translate-x-0 group-hover:-translate-y-0"></span>
                    <span className="absolute inset-0 w-full h-full bg-white border-2 border-black group-hover:bg-black"></span>
                    <span className="relative text-black group-hover:text-white">
                      <p className="text-base">{d.name}</p>
                      <p className="text-sm text-gray-500">
                        Last Modified : {timeAgo.format(Number(d.timestamp))}
                      </p>{" "}
                    </span>
                  </div>
                  <div className="text-center"></div>
                </Link>
              </div>
            ) : (
              ""
            )
          )}
          {docs && docs.length == 0 && (
            <p className="mt-20 text-center text-2xl">
              No Documents Created Yet
            </p>
          )}
        </div>
        <div className="mx-auto mt-8 flex items-center justify-center gap-5">
          <Input ref={docName} placeholder="name" />
          <Button onClick={createHandler}>Create</Button>
        </div>
      </div>
    </>
  );
}
