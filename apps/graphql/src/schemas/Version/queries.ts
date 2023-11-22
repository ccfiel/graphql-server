import { builder } from '../../builder'

builder.queryField('version', t =>
  t.field({
    type: 'String',
    resolve: async (parent, args, context) => {
      const version = '#{VERSION}'
      if (version.includes('{VERSION}')) {
        return 'development'
      }
      return version
    },
  }),
)
