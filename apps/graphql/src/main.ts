#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { Config } from './config.js'
import { ServerResponse, createServer } from 'node:http'

import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { checkDbAvailable } from './db'
import { schema } from './schema'
import { auth } from './db'
import { Session } from 'lucia'

const nodePath = resolve(process.argv[1])
const modulePath = resolve(fileURLToPath(import.meta.url))
const isCLI = nodePath === modulePath

async function getSession(req: any): Promise<Session | null> {
  const authRequest = auth.handleRequest(req)
  const session = await authRequest.validate()
  if (!session) {
    return session
  } else {
    return null
  }
}
export default function main(port: number = Config.port) {
  const yoga = createYoga({
    graphqlEndpoint: '/',
    healthCheckEndpoint: '/live',
    landingPage: false,
    schema,
    context: async ({ req }: ServerResponse) => ({
      currentSession: await getSession(req),
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
