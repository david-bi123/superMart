import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    businessId?: string;
    branchId?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      businessId?: string;
      branchId?: string;
      name?: string;
      email?: string;
      image?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    businessId?: string;
    branchId?: string;
  }
}
