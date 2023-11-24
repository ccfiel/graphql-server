import { generateRandomString, isWithinExpiration } from 'lucia/utils'
import { db } from '../db'

const EXPIRES_IN = 1000 * 60 * 60 * 2 // 2 hours

export const generateEmailVerificationToken = async (userId: string) => {
  const aggregations = await db.emailVerificationToken.aggregate({
    _count: {
      _all: true,
    },
    where: {
      user_id: {
        equals: userId ?? '',
      },
    },
  })

  if (aggregations._count._all > 0) {
    const reusableStoredToken = await db.emailVerificationToken.findFirst({
      where: {
        user_id: {
          equals: userId ?? '',
        },
      },
    })

    if (reusableStoredToken) {
      if (isWithinExpiration(Number(reusableStoredToken.expires) - EXPIRES_IN / 2)) return reusableStoredToken.id
    }
  }
  const token = generateRandomString(63)
  await db.emailVerificationToken.create({
    data: {
      id: token,
      expires: new Date().getTime() + EXPIRES_IN,
      user_id: userId ?? '',
    },
  })
  return token
}

export const validateEmailVerificationToken = async (token: string) => {
  const storedToken = await db.emailVerificationToken.findFirst({
    where: {
      id: {
        equals: token ?? '',
      },
    },
  })

  if (!storedToken) throw new Error('Invalid token')

  await db.emailVerificationToken.deleteMany({
    where: {
      user_id: {
        equals: storedToken.user_id,
      },
    },
  })

  const tokenExpires = Number(storedToken.expires) // bigint => number conversion
  if (!isWithinExpiration(tokenExpires)) {
    throw new Error('Expired token')
  }
  return storedToken.user_id
}

export const generatePasswordResetToken = async (userId: string) => {
  const aggregations = await db.passwordResetToken.aggregate({
    _count: {
      _all: true,
    },
    where: {
      user_id: {
        equals: userId ?? '',
      },
    },
  })

  if (aggregations._count._all > 0) {
    const reusableStoredToken = await db.passwordResetToken.findFirst({
      where: {
        user_id: {
          equals: userId ?? '',
        },
      },
    })

    if (reusableStoredToken) {
      if (isWithinExpiration(Number(reusableStoredToken.expires) - EXPIRES_IN / 2)) return reusableStoredToken.id
    }
  }
  const token = generateRandomString(63)
  await db.passwordResetToken.create({
    data: {
      id: token,
      expires: new Date().getTime() + EXPIRES_IN,
      user_id: userId ?? '',
    },
  })
  return token
}

export const validatePasswordResetToken = async (token: string) => {
  const storedToken = await db.emailVerificationToken.findFirst({
    where: {
      id: {
        equals: token ?? '',
      },
    },
  })

  if (!storedToken) throw new Error('Invalid token')

  await db.passwordResetToken.deleteMany({
    where: {
      user_id: {
        equals: storedToken.user_id,
      },
    },
  })
  const tokenExpires = Number(storedToken.expires) // bigint => number conversion

  if (!isWithinExpiration(tokenExpires)) {
    throw new Error('Expired token')
  }
  return storedToken.user_id
}

export const isValidPasswordResetToken = async (token: string) => {
  const storedToken = await db.emailVerificationToken.findFirst({
    where: {
      id: {
        equals: token ?? '',
      },
    },
  })

  if (!storedToken) return false

  const tokenExpires = Number(storedToken.expires) // bigint => number conversion
  if (!isWithinExpiration(tokenExpires)) {
    return false
  }
  return true
}
