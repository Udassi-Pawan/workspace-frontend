import { withAuth } from "next-auth/middleware";

export default withAuth({
  // Matches the pages config in `[...nextauth]`
  pages: {
    signIn: "/login",
  },
});
// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/group/:id*", "/", "/collab/:docId*", "/create"],
};
