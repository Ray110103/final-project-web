import { User } from "./user";

interface LoginPayload extends User {
  accessToken: string;
}

declare module "next-auth" {
  interface Session {
    user: LoginPayload;
    accessToken: string;
  }

  // Fix: Don't extend LoginPayload, define base properties
  interface User {
    id: string;
    name: string;
    email: string;
    pictureProfile?: string;
    role?: string;
    accessToken?: string;
    token?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: LoginPayload;
    accessToken: string;
  }
}