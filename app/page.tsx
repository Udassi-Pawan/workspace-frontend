import { getServerSession } from "next-auth";
import { handler } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import { useTheme } from "next-themes";
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
      <a
        href="#"
        className="flex flex-col items-center bg-white border border-gray-100 rounded-lg shadow md:flex-row md:max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <img
          className="object-cover w-full rounded-t-lg h-96 md:h-auto md:w-48 md:rounded-none md:rounded-l-lg"
          src="images/1.jpg"
          alt=""
        />
        <div className="flex flex-col justify-between p-4 leading-normal">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Noteworthy technology acquisitions 2021
          </h5>
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
            Here are the biggest enterprise technology acquisitions of 2021 so
            far, in reverse chronological order.
          </p>
        </div>
      </a>
      <h1 className="">other groups</h1>
      {_allGroups?.map((g: any) => (
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
