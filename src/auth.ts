import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        // Handle OAuth token dari callback
        if (credentials?.token) {
          return {
            id: "temp",
            name: "temp",
            email: "temp@temp.com",
            token: credentials.token as string,
          };
        }
        
        // Handle regular login response dari useLogin
        if (credentials?.accessToken) {
          return {
            id: String(credentials.id || "0"),
            name: String(credentials.name || ""),
            email: String(credentials.email || ""),
            pictureProfile: String(credentials.pictureProfile || ""),
            role: String(credentials.role || ""),
            accessToken: String(credentials.accessToken),
          };
        }
        
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // 2 hours
  },

  trustHost: true,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.user = user as any;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },

    async session({ session, token }: any) {
      if (token.user) {
        session.user = token.user;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },

  events: {
    async signOut() {
      // Clear localStorage tokens saat signOut
      if (typeof window !== 'undefined') {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
      }
    },
  },
});