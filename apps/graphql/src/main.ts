#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config'
import { Config } from './config.js'
import express from 'express'

import { createYoga, useReadinessCheck } from 'graphql-yoga'

import { checkDbAvailable } from './db'
import { schema } from './schema'
import { auth } from './db'
import { Session } from 'lucia'

const app = express()

async function getSession(req: any): Promise<Session | null> {
  
  if (req.headers.get('authorization')!==null) {
    console.log('req', req.headers.get('authorization'))
  }

  const authRequest = auth.handleRequest(req)
  const session = await authRequest.validateBearerToken()
  if (req.headers.get('authorization')!==null) {
    console.log('req', req.headers.get('authorization'))
    console.log('session', session)
  }

  if (session) {
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
    context: async req => ({
      currentSession: await getSession(req.request),
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
  app.use('/', yoga)
  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}

main()
