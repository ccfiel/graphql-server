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
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [svelte-kit](https://kit.svelte.dev/) app
- `web`: another [svelte-kit](https://kit.svelte.dev/) app
- `ui`: a stub Svelte component library shared by both `web` and `docs` applications
- `eslint-config-custom`: `eslint` configurations (includes `eslint-plugin-svelte` and `eslint-config-prettier`)

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
