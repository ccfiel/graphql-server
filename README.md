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
- `github-oauth`: another [svelte-kit](https://kit.svelte.dev/) app
- `username-and-password`: a stub Svelte component library shared by both `web` and `docs` applications
- `graphql`: `eslint` configurations (includes `eslint-plugin-svelte` and `eslint-config-prettier`)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
