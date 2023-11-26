/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth, db } from '../../db'
import { builder } from '../../builder'
import { GraphQLError } from 'graphql'
import { isValidEmail } from '../../utils/email'
import { generateEmailVerificationToken } from '../../utils/token'
import { sendEmailVerificationLink, sendPasswordResetLink } from '../../utils/email'
import { validateEmailVerificationToken, generatePasswordResetToken, validatePasswordResetToken } from '../../utils/token'

const UserType = builder.simpleObject('UserType', {
  fields: t => ({
    userId: t.string({
      nullable: false,
    }),
    email: t.string({
      nullable: true,
    }),
    emailVerified: t.boolean({
      nullable: true,
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

async function signIn(providerId: string, username: string, password: string) {
  const key = await auth.useKey(providerId, username, password)
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
      providerId: t.arg.string({}),
      username: t.arg.string({}),
      password: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { username, password, providerId } = args
      try {
        const session = await signIn(providerId!, username!, password!)
        if (!session.user.userId) {
          throw new Error('Authentication failed')
        }
        return {
          user: {
            userId: session.user.userId,
            email: session.user.email ?? '',
            emailVerified: session.user.emailVerified ?? false,
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
            email_verified: false,
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
        await sendEmailVerificationLink(token)
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
    authScopes: {
      isAuthenticated: true,
    },
    type: 'String',
    resolve: async (_, args, context) => {
      const token = await generateEmailVerificationToken(context.currentSession.user.userId ?? '')
      await sendEmailVerificationLink(token)
      return token
    },
  }),
)

builder.mutationField('validateEmailVerificationToken', t =>
  t.field({
    type: SessionType,
    args: {
      token: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { token } = args
      try {
        const userId = await validateEmailVerificationToken(token ?? '')
        const user = await auth.getUser(userId)

        await auth.invalidateAllUserSessions(user.userId)
        await auth.updateUserAttributes(user.userId, {
          email_verified: true,
        })
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
            email: user.email ?? '',
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

builder.mutationField('generatePasswordResetToken', t =>
  t.field({
    type: 'String',
    args: {
      email: t.arg.string({}),
    },
    resolve: async (_, args ) => {
      const { email } = args
      if (!isValidEmail(email)) {
        return Promise.reject(new GraphQLError('Invalid email'))
      }

      const user = await db.user.findFirst({
        where: {
          email: email.toLowerCase(),
        },
      })
			const token = await generatePasswordResetToken(user?.id ?? '');
			await sendPasswordResetLink(token);
      return token
    },
  }),
)

builder.mutationField('changePassword', t =>
  t.field({
    type: SessionType,
    args: {
      token: t.arg.string({}),
      password: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { token, password } = args
      if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
        return Promise.reject(new GraphQLError('Invalid password'))
      }
      try {
        const userId = await validatePasswordResetToken(token ?? '')
        const user = await auth.getUser(userId)
        await auth.invalidateAllUserSessions(user.userId)
        await auth.updateKeyPassword('email', user.email, password);
        await auth.updateUserAttributes(user.userId, {
          email_verified: true,
        })
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
            email: user.email ?? '',
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
