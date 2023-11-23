import { auth } from '../../db'
import { builder } from '../../builder'
import { GraphQLError } from 'graphql'


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
      } catch (error) {
        throw error
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        return Promise.reject(
          new GraphQLError(error.message)
        )
      }
    },
  }),
)
