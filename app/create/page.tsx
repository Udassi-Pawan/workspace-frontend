"use client";
import { useSession } from "next-auth/react";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/shardcn/components/ui/button";
import { Input } from "@/shardcn/components/ui/input";
import { Textarea } from "@/shardcn/components/ui/textarea";
let image: string | ArrayBuffer;

const convertToBase64 = (e: ChangeEvent<HTMLInputElement>) => {
  var reader = new FileReader();
  reader.readAsDataURL(e.target.files![0]);
  reader.onload = () => {
    console.log(reader.result);
    image = reader.result!;
  };
};

export interface pageProps {}
export default function page({}: pageProps) {
  const { data: session } = useSession();
  console.log(session);
  // if (session == null) {
  //   return redirect("/login");
  // }
  const groupName = useRef<HTMLInputElement>(null);
  const groupDesc = useRef<HTMLTextAreaElement>(null);
  const [allUsers, setAllUsers] = useState<User[] | null>(null);
  useEffect(() => {
    async function getAllUsers() {
      const _allUsers = await (
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/all`)
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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/group/create`,
      {
        name: groupName.current!.value,
        members,
        image,
        description: groupDesc.current?.value,
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
    <div className="flex flex-col gap-8 justify-around items-center h-full">
      <h1 className="mt-5 text-4xl text-center">Create Group Now</h1>
      <Input className="w-60" ref={groupName} placeholder="name" />{" "}
      <Textarea
        ref={groupDesc}
        className=" w-[80vw] sm:w-[60vw] "
        placeholder="Group Description"
      />
      <h1 className="text-xl text-center sm:text-2xl">
        Please choose a Profile Picture:
      </h1>
      <Input
        onChange={convertToBase64}
        className="w-auto"
        accept="image/*"
        type="file"
      ></Input>
      <h1 className="text-xl text-center  sm:text-2xl">
        Please select members to add:
      </h1>
      <div className="">
        {allUsers?.map((u) =>
          u.email == session?.user?.email ? null : (
            <div key={u._id} className="">
              <input type="checkbox" id={"member " + u._id} value={u._id} />
              <label> {u.name} </label>
            </div>
          )
        )}
      </div>
      <Button size={"lg"} onClick={createHandler}>
        Create
      </Button>
    </div>
  );
}
