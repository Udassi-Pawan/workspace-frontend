"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { decode } from "next-auth/jwt";
import { useEffect } from "react";

const Signin = () => {
  const { data: session } = useSession();
  console.log(session);
  // useEffect(() => {
  //   (async () => {
  //     const decoded = await decode({
  //       token: session?.access_token,
  //       secret: process.env.NEXTAUTH_SECRET,
  //     });
  //     // console.log(decoded);
  //   })();
  // });

  if (session && session.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>{session.user.name}</p>
        <button onClick={() => signOut()}> sign out </button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center h-screen">
      <button className="" onClick={async () => await signIn()}>
        signin
      </button>
    </div>
  );
};

export default Signin;
