import NextAuth, { Profile } from "next-auth";
import { JWT } from "next-auth/jwt";
import Google from "next-auth/providers/google";

interface GoogleProfile extends Profile {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
}

if (!process.env.NEXT_GOOGLE_OAUTH_CLIENT_ID) {
  throw new Error("Missing GOOGLE_OAUTH_CLIENT_ID");
}
if (!process.env.NEXT_GOOGLE_OAUTH_CLIENT_SECRET) {
  throw new Error("Missing GOOGLE_OAUTH_CLIENT_SECRET");
}
if (!process.env.AUTH_SECRET) {
  throw new Error("Missing AUTH_SECRET");
}

const handler = NextAuth({
  secret:process.env.AUTH_SECRET,
  providers: [
    Google({
      clientSecret: process.env.NEXT_GOOGLE_OAUTH_CLIENT_SECRET!,
      clientId: process.env.NEXT_GOOGLE_OAUTH_CLIENT_ID!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }): Promise<JWT> {
      if (account && profile) {
        // const providerAccountId = account.providerAccountId ?? account.userId ?? profile.sub ?? "";
        const google_profile = profile as GoogleProfile;

        //==========================MAKE CHANGES HERE
        token.provider = account.providerAccountId ?? account.userId ?? profile.sub ?? "";
        token.email = google_profile.email ?? ""
        token.name = google_profile.name ?? ""
        token.image = google_profile.image

      }
      return token as JWT;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          // user_id: (token as unknown as { user_id?: string }).user_id,
          // hasProfile: (token as unknown as { hasProfile?: boolean }).hasProfile,
          provider: token.provider,
          providerAccountId : token.providerAccountId
        },
      };
    },
  },
});

export { handler as GET, handler as POST };
