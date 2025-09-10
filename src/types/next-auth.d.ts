import { User } from "../../types/user";

interface LoginPayload extends User {
  accessToken: string;
}

declare module "next-auth" {
  interface Session {
    user: LoginPayload;
  }
}

