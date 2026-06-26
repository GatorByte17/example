import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const DASHBOARD_USER = process.env.DASHBOARD_USER ?? "admin";
const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD ?? "changeme";

// Hash the password once at module load (synchronous, but only runs once)
const hashedPassword = bcrypt.hashSync(DASHBOARD_PASSWORD, 10);

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Dashboard",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        if (credentials.username !== DASHBOARD_USER) return null;
        const valid = bcrypt.compareSync(credentials.password, hashedPassword);
        if (!valid) return null;
        return { id: "1", name: DASHBOARD_USER };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
};
