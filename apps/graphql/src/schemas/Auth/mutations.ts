import { auth } from '../../db'
import { builder } from '../../builder'

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

async function signIn(email: string, password: string) {
  const key = await auth.useKey('username', email, password)
  const session = await auth.createSession({
    userId: key.userId,
    attributes: {},
  })
  
  return session
}

async function signUp(email: string, password: string) {
  const user = await auth.createUser({
    key: {
      providerId: 'username',
      providerUserId: email,
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
      email: t.arg.string({}),
      password: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { email, password } = args
      try {
        const session = await signIn(email!, password!)
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
        throw new Error('Authentication failed')
      }
    },
  }),
)

builder.mutationField('signup', t =>
  t.field({
    type: SessionType,
    args: {
      email: t.arg.string({}),
      password: t.arg.string({}),
    },
    resolve: async (_, args) => {
      const { email, password } = args
      try {
        const user = await signUp(email!, password!)
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
      } catch (error) {
        console.error(error)
        throw new Error('Authentication failed')
      }
    },
  }),
)
