"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/shardcn/components/ui/button";
import Image from "next/image";

const Signin = () => {
  const { data: session } = useSession();

  if (session && session.user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>{session.user.name}</p>
        <button onClick={() => signOut()}> sign out </button>
      </div>
    );
  }
  return (
    <Button
      onClick={async () => await signIn("google")}
      className="flex bg-primary text-primary-foreground  gap-2 p-3 rounded-3xl"
    >
      <Image
        src="/images/google.png" // Replace with the actual path to your Google logo image
        alt="Google Logo"
        height={"20"}
        width={"20"}
      />
      Continue with Google
    </Button>
  );
};

export default Signin;
