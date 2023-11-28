# Lucia Auth Example with separate client and server

An example code with separate client and server using token base authentication.

## Using this example

Run the following command:

```sh
git clone https://github.com/ccfiel/graphql-server
cd graphql-server
pnpm install
cd apps/graphql
cp .env.sample .env
pnpm generate
npx prisma db push
pnpm dev
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `email-and-password`: an lucia example app that uses email and password for authentication
- `github-oauth`: example app that uses github oauth
- `username-and-password`: an lucia example app that uses username and password for authentication
- `graphql`: an graphql server to serve auth.

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [Lucia](https://lucia-auth.com/) is an auth library for TypeScript that abstracts away the complexity of handling users and sessions.
- [GraphQLYoga](https://the-guild.dev/graphql/yoga-server/) Fully-featured GraphQL Server with focus on easy setup, performance & great developer experience.
- [Pothos](https://pothos-graphql.dev/) is a plugin based GraphQL schema builder for typescript. It makes building graphql schemas in typescript easy, fast and enjoyable.
- [Houdini](https://houdinigraphql.com/) unifies your GraphQL client and application router so you can stop worrying about waterfalls, code-splitting, and so much more. Fully automatic and totally customizable.

