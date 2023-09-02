"use client";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

export interface pageProps {}
export default function page({}: pageProps) {
  const { data: session } = useSession();
  console.log(session);
  const groupName = useRef<HTMLInputElement>(null);
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  useEffect(() => {
    async function getAllUsers() {
      const _allUsers = await (
        await fetch("http://localhost:3333/users/all")
      ).json();
      setAllUsers(_allUsers);
    }
    getAllUsers();
  }, []);
  console.log(allUsers);
  const createHandler = async function () {
    if (!groupName.current!.value) return alert("name empty");
    const members: string[] = [];
    allUsers?.map((u) => {
      if (u.email == session?.user?.email) return;
      if (document.getElementById("member " + u._id)!.checked) {
        members.push(u._id);
      }
    });
    const request = await axios.post(
      "http://localhost:3333/group/create",
      {
        name: groupName.current!.value,
        members,
      },
      {
        headers: {
          "Authorization": `Bearer ${session?.authToken}`,
        },
      }
    );
    console.log(request);
  };

  return (
    <div className="">
      <input ref={groupName} placeholder="name" />{" "}
      <button onClick={createHandler}>create</button>
      {allUsers?.map((u) =>
        u.email == session?.user.email ? null : (
          <div key={u._id} className="">
            <input type="checkbox" id={"member " + u._id} value={u._id} />
            <label> {u.name} </label>
          </div>
        )
      )}
      <br></br>
    </div>
  );
}
