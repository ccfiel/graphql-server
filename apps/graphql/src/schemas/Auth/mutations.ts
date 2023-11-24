/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '../../db'
import { builder } from '../../builder'
import { GraphQLError } from 'graphql'
import { isValidEmail } from '../../utils/email'
import { generateEmailVerificationToken } from '../../utils/token'
import { sendEmailVerificationLink } from '../../utils/email'

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

builder.mutationField('signupWithUserName', t =>
  t.field({
    type: SessionType,
    args: {
      username: t.arg.string({}),
      password: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { username, password } = args
      try {
        const user = await auth.createUser({
          key: {
            providerId: 'username',
            providerUserId: username ?? '',
            password: password ?? '',
          },
          attributes: {},
        })
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

builder.mutationField('signupWithEmail', t =>
  t.field({
    type: SessionType,
    args: {
      email: t.arg.string({}),
      password: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { email, password } = args
      if (!isValidEmail(email)) {
        return Promise.reject(new GraphQLError('Invalid email'))
      }
      if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
        return Promise.reject(new GraphQLError('Invalid password'))
      }

      try {
        const user = await auth.createUser({
          key: {
            providerId: 'email', // auth method
            providerUserId: email.toLowerCase(), // unique id when using "email" auth method
            password, // hashed by Lucia
          },
          attributes: {
            email: email.toLowerCase(),
            email_verified: Number(false),
          },
        })

        const session = await auth.createSession({
          userId: user.userId,
          attributes: {},
        })
        if (!session) {
          throw new Error('Cannot create session')
        }
        const token = await generateEmailVerificationToken(user.userId)
        await sendEmailVerificationLink(token);
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
