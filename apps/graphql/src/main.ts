#!/usr/bin/env node
import 'dotenv/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { Config } from './config.js'
import { ServerResponse, createServer } from 'node:http'

import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { checkDbAvailable } from './db'
import { User } from './schemas/Auth'
import { schema } from './schema'

const nodePath = resolve(process.argv[1])
const modulePath = resolve(fileURLToPath(import.meta.url))
const isCLI = nodePath === modulePath

function getUserFromAuthHeader(authHeader: string): User | null {
  const currentUser = new User('admin', 'admin@email.com', '123456')

  // if (authHeader) {
  //   const [type, token] = authHeader.split(' ')
  //   let currentUser: User | null = null

  //   if (type !== 'Bearer') {
  //     return null
  //   } else {
  //     if (!token) {
  //       return null
  //     } else if (token === '123456') {
  //       currentUser = new User('admin', 'admin@email.com', '123456')
  //     }
  //   }
  //   return currentUser
  // } else {
  //   return null
  // }
  return currentUser
}

export default function main(port: number = Config.port) {
  // const client = new PrismaClient()

  // const auth = lucia({
  //   adapter: prisma(client, {
  //     user: 'user', // model User {}
  //     key: 'key', // model Key {}
  //     session: 'session', // model Session {}
  //   }),
  //   env: 'DEV',
  // })

  const yoga = createYoga({
    graphqlEndpoint: '/',
    healthCheckEndpoint: '/live',
    landingPage: false,
    schema,
    context: async ({ req }: ServerResponse) => ({
      currentUser: getUserFromAuthHeader(req.headers.authorization?.toString() ?? ''),
    }),
    plugins: [
      useReadinessCheck({
        endpoint: '/ready',
        check: async () => {
          const check = await checkDbAvailable()
          return check
        },
      }),
    ],
  })
  const server = createServer(yoga)
  if (isCLI) {
    server.listen(port, () => {
      console.info(`Server is running on http://localhost:${port}`)
    })
  }

  return server
}

if (isCLI) {
  main()
}
