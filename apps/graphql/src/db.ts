import { PrismaClient } from '@prisma/client'
import { lucia } from 'lucia'
import { prisma } from '@lucia-auth/adapter-prisma'
import { web } from 'lucia/middleware'
import { github } from '@lucia-auth/oauth/providers';
import 'dotenv/config'

export const db = new PrismaClient()

export const auth = lucia({
  adapter: prisma(db, {
    user: 'user',
    key: 'key',
    session: 'session',
  }),
  getUserAttributes: (databaseUser) => {
		return {
      username: databaseUser.username,
			email: databaseUser.email,
      emailVerified: databaseUser.email_verified,
		};
	},
  middleware: web(),
  env: 'DEV',
})

export async function checkDbAvailable(): Promise<boolean> {
  try {
    await db.$connect()
    return true
  } catch (error) {
    return false
  }
}

export const githubAuth = github(auth, {
	clientId: process.env.GITHUB_CLIENT_ID || '',
	clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
});


export type Auth = typeof auth
