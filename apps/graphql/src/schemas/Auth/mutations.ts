/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth, db } from '../../db'
import { builder } from '../../builder'
import { GraphQLError } from 'graphql'
import { generateRandomString, isWithinExpiration } from 'lucia/utils'

const EXPIRES_IN = 1000 * 60 * 60 * 2 // 2 hours

const UserType = builder.simpleObject('User', {
  fields: t => ({
    userId: t.string({
      nullable: false,
    }),
  }),
})

const SessionType = builder.simpleObject('Session', {
  fields: t => ({
    user: t.field({
      type: UserType,
      nullable: false,
    }),
    sessionId: t.string({
      nullable: false,
    }),
    idlePeriodExpiresAt: t.field({
      type: 'DateTime',
      nullable: false,
    }),
    activePeriodExpiresAt: t.field({
      type: 'DateTime',
      nullable: false,
    }),
    state: t.string({
      nullable: false,
    }),
    fresh: t.boolean({
      nullable: false,
    }),
  }),
})

async function signIn(username: string, password: string) {
  const key = await auth.useKey('username', username, password)
  const session = await auth.createSession({
    userId: key.userId,
    attributes: {},
  })

  return session
}

async function signUp(username: string, password: string) {
  const user = await auth.createUser({
    key: {
      providerId: 'username',
      providerUserId: username,
      password,
    },
    attributes: {},
  })
  return user
}

builder.mutationField('signin', t =>
  t.field({
    type: SessionType,
    args: {
      username: t.arg.string({}),
      password: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { username, password } = args
      try {
        const session = await signIn(username!, password!)
        if (!session.user.userId) {
          throw new Error('Authentication failed')
        }
        return {
          user: {
            userId: session.user.userId,
          },
          sessionId: session.sessionId,
          idlePeriodExpiresAt: session.idlePeriodExpiresAt,
          activePeriodExpiresAt: session.activePeriodExpiresAt,
          state: session.state,
          fresh: session.fresh,
        }
      } catch (error: any) {
        return Promise.reject(new GraphQLError(error.message))
      }
    },
  }),
)

builder.mutationField('signup', t =>
  t.field({
    type: SessionType,
    args: {
      username: t.arg.string({}),
      password: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { username, password } = args
      try {
        const user = await signUp(username!, password!)
        if (!user.userId) {
          throw new Error('Authentication failed')
        }
        const session = await auth.createSession({
          userId: user.userId,
          attributes: {},
        })
        if (!session) {
          throw new Error('Cannot create session')
        }
        return {
          user: {
            userId: session.user.userId,
          },
          sessionId: session.sessionId,
          idlePeriodExpiresAt: session.idlePeriodExpiresAt,
          activePeriodExpiresAt: session.activePeriodExpiresAt,
          state: session.state,
          fresh: session.fresh,
        }
      } catch (error: any) {
        return Promise.reject(new GraphQLError(error.message))
      }
    },
  }),
)

builder.mutationField('logout', t =>
  t.field({
    type: 'Boolean',
    resolve: async (_, args, context) => {
      if (context.currentSession?.sessionId) {
        try {
          await auth.invalidateSession(context.currentSession.sessionId)
          return true
        } catch (error: any) {
          return Promise.reject(new GraphQLError(error.message))
        }
      } else {
        return Promise.reject(new GraphQLError('Invalid session'))
      }
    },
  }),
)

builder.mutationField('generateEmailVerificationToken', t =>
  t.field({
    type: 'String',
    args: {
      userId: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { userId } = args

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
    },
  }),
)

builder.mutationField('validateEmailVerificationToken', t =>
  t.field({
    type: 'String',
    args: {
      token: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { token } = args
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
    },
  }),
)

builder.mutationField('generatePasswordResetToken', t =>
  t.field({
    type: 'String',
    resolve: async (_, args, context) => {
      const aggregations = await db.passwordResetToken.aggregate({
        _count: {
          _all: true,
        },
        where: {
          user_id: {
            equals: context.currentSession.user.userId ?? '',
          },
        },
      })

      if (aggregations._count._all > 0) {
        const reusableStoredToken = await db.passwordResetToken.findFirst({
          where: {
            user_id: {
              equals: context.currentSession.user.userId ?? '',
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
          user_id: context.currentSession.user.userId ?? '',
        },
      })
      return token
    },
  }),
)

builder.mutationField('validatePasswordResetToken', t =>
  t.field({
    type: 'String',
    args: {
      token: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { token } = args
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
    },
  }),
)

builder.mutationField('isValidPasswordResetToken', t =>
  t.field({
    type: 'Boolean',
    args: {
      token: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { token } = args
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
    },
  }),
)
