import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import axios from "axios";
import Link from "next/link";
export default function Collab({
  docs,
  groupId,
}: {
  docs: string[];
  groupId: string;
}) {
  const docName = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const createHandler = async function () {
    const req = await axios.post("http://localhost:3333/doc/create", {
      groupId,
      name: docName.current!.value,
    });
    console.log(req);
    router.push(`/collab/${req.data._id}`);
  };
  if (docs) console.log("docs", docs[0]);
  return (
    <div className="">
      <input ref={docName} placeholder="name" />
      <button onClick={createHandler}>create</button>

      <div className="">
        {docs?.map((d) =>
          d ? (
            <Link key={d} href={`/collab/${d}`}>
              <p>{d}</p>
            </Link>
          ) : (
            ""
          )
        )}
      </div>
    </div>
  );
}
