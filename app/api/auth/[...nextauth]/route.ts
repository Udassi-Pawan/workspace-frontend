import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      httpOptions: {
        timeout: 40000,
      },
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  // session: {
  //   maxAge: 3600,
  // },
  // jwt: {
  //   maxAge: 3600,
  // },
  callbacks: {
    async redirect({ url, baseUrl }) {
      return "/";
    },
    async jwt({ token, account, user }) {
      if (account) {
        const res = await fetch("http://localhost:3333/auth/login", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${account?.id_token}`,
          },
        });
        const resParsed = await res.json();
        // console.log("RES:", resParsed.authToken);
        console.log("USER:", user);
        token = Object.assign({}, token, {
          id_token: account.id_token,
        });
        token = Object.assign({}, token, {
          myToken: resParsed.authToken,
        });
      }

      return token;
    },
    async session({ session, token }) {
      if (session) {
        session = Object.assign({}, session, {
          id_token: token.id_token,
        });
        session = Object.assign({}, session, {
          authToken: token.myToken,
        });
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST, handler };
