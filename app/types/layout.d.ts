import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    authToken: string;
  }
}
