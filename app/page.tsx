import { getServerSession } from "next-auth";
import { handler } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
export interface pageProps {}

export default async function Page({}: pageProps) {
  const session = (await getServerSession(handler)) as { user: any };
  const _allGroups = await (
    await fetch("http://localhost:3333/group/all")
  ).json();
  console.log(`all groups`, _allGroups);
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5 overflow-y-scroll">
      <h1 className="">my groups</h1>
      {_allGroups?.map((g: any) => (
        <div className="">
          {g.members.find((m: any) => m.email == session.user.email) && (
            <Link href={`/group/${g._id}`}>
              <p className=""> {g.name} </p>
            </Link>
          )}
        </div>
      ))}

      <h1 className="">other groups</h1>
      {_allGroups.map((g: any) => (
        <div className="">
          {!g.members.find((m: any) => m.email == session.user.email) && (
            <Link href={`/group/${g._id}`}>
              <p className=""> {g.name} </p>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
