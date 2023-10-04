import { getServerSession } from "next-auth";
import { handler } from "./api/auth/[...nextauth]/route";
import Link from "next/link";
import "./page.css";
export interface pageProps {}

export default async function Page({}: pageProps) {
  const session = (await getServerSession(handler)) as { user: any };
  const _allGroups = await (
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/group/all`)
  ).json();

  return (
    <div className="flex flex-col items-center justify-around h-screen overflow-y-scroll">
      <Link href="/create">
        <button className="BtnCreate">
          <div className="signCreate">+</div>
          <div className="textCreate">Create</div>
        </button>
      </Link>
      <div className="flex flex-col items-center justify-center gap-5">
        <h1 className="text-5xl font-bold">My Groups</h1>
        {_allGroups?.map((g: any) => (
          <div key={g._id} className="">
            {g.members.find((m: any) => m.email == session.user.email) && (
              <Link href={`/group/${g._id}`}>
                <div className="mx-5 flex items-center bg-white border border-gray-100 rounded-lg shadow flex-row max-w-xl hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                  <img
                    className="object-cover rounded-t-lg h-auto w-1/5  rounded-none rounded-l-lg"
                    src={g.image}
                    alt=""
                  />
                  <div className="flex flex-col justify-between p-4 leading-normal">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {g.name}
                    </h5>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                      {g.description}{" "}
                    </p>
                  </div>
                </div>{" "}
              </Link>
            )}
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center gap-5">
        <h1 className="text-5xl font-bold mb-2 text-center">Explore Groups</h1>
        {_allGroups?.map((g: any) => (
          <div key={g._id} className="">
            {!g.members.find((m: any) => m.email == session.user.email) && (
              <Link href={`/group/${g._id}`}>
                <div
                  style={{ width: "300px" }}
                  className="flex justify-center gap-5 items-center bg-white border border-gray-100 rounded-lg shadow  hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  {g.image && (
                    <img
                      className="object-cover rounded-t-lg h-auto w-1/4 sm:w-1/5 rounded-none rounded-l-lg"
                      src={g.image}
                      alt=""
                    />
                  )}
                  <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {g.name}
                  </h5>
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
