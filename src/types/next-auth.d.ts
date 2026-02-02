import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      schoolId: string
      school?: any
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    schoolId: string
    school?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    schoolId: string
    school?: any
  }
}