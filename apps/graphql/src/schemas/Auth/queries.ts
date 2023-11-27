/* eslint-disable @typescript-eslint/no-explicit-any */
import { builder } from '../../builder'
import { githubAuth } from '../../db'
import { GraphQLError } from 'graphql'

builder.queryField('getGitHubVerificationURL', t =>
  t.field({
    type: 'String',
    resolve: async (_) => {
      try {
        const [url] = await githubAuth.getAuthorizationUrl()
        return url.toString()
      } catch (error: any) {
        return Promise.reject(new GraphQLError(error.message))
      }
    },
  }),
)
