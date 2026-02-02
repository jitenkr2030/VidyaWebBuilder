import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "./db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt for email:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              school: true
            }
          })

          if (!user) {
            console.log('❌ User not found:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', credentials.email)
            return null
          }

          console.log('✅ User authenticated successfully:', credentials.email, 'Role:', user.role)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
            school: user.school
          }
        } catch (error) {
          console.error('❌ Authentication error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.schoolId = user.schoolId
        token.school = user.school
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.schoolId = token.schoolId as string
        session.user.school = token.school as any
      }
      return session
    }
  },
  pages: {
    signIn: "/"
  },
  debug: false,
  secret: process.env.NEXTAUTH_SECRET || "vidyawebbuilder-secret-key-2024-production-ready"
}