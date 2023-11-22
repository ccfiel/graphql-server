import { PrismaClient } from '@prisma/client'
import { lucia } from 'lucia'
import { prisma } from '@lucia-auth/adapter-prisma'

export const db = new PrismaClient()

export const auth = lucia({
  adapter: prisma(db, {
    user: 'user', // model User {}
    key: 'key', // model Key {}
    session: 'session', // model Session {}
  }),
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
