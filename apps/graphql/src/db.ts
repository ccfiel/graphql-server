import { PrismaClient } from '@prisma/client'
import { lucia } from 'lucia'
import { prisma } from '@lucia-auth/adapter-prisma'
import { web } from 'lucia/middleware'

export const db = new PrismaClient()

export const auth = lucia({
  adapter: prisma(db, {
    user: 'user',
    key: 'key',
    session: 'session',
  }),
  getUserAttributes: (databaseUser) => {
		return {
			email: databaseUser.email,
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

export type Auth = typeof auth
