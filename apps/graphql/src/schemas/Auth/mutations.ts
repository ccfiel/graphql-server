import { auth } from '../../db'
import { builder } from '../../builder'

export class User {
  userId: string

  email: string

  token: string

  constructor(userId: string, email: string, token: string) {
    this.userId = userId
    this.email = email
    this.token = token
  }
}

const AuthPayload = builder.simpleObject('AuthPayload', {
  fields: t => ({
    token: t.string({
      nullable: false,
    }),
  }),
})

async function signIn(email: string, password: string) {
  const key = await auth.useKey('username', email, password)
  const session = await auth.createSession({
    userId: key.userId,
    attributes: {}
  });
  return session
}

async function signUp(email: string, password: string) {
  const user = await auth.createUser({
    key: {
      providerId: "username", 
      providerUserId: email, 
      password 
    },
    attributes: {
    }
  });
  return user
}


builder.mutationField('signin', t =>
  t.field({
    type: AuthPayload,
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
        const token = session.sessionId
        if (!token) {
          throw new Error('Token not found')
        }
        return {
          token,
        }
      } catch (error) {
        throw new Error('Authentication failed')
      }
    },
  }),
)

builder.mutationField('signup', t =>
  t.field({
    type: AuthPayload,
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
          attributes: {}
        });
        if (!session) {
          throw new Error('Cannot create session')
        }
        const token = JSON.stringify(session)
        return {
          token,
        }
      } catch (error) {
        console.error(error)
        throw new Error('Authentication failed')
      }
    },
  }),
)


