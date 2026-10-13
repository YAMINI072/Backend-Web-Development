# Database Integration

This API keeps PostgreSQL and Prisma behind the post repository. Services and controllers continue to use the same asynchronous repository contract.

## Requirements and setup

Use Node.js 18+ and a running PostgreSQL instance. Copy `.env.example` to `.env` and replace the placeholder with a local development connection string. Never commit `.env` or real credentials.

```bash
npm install
cp .env.example .env
```

Apply the committed migration, generate Prisma Client, and seed a repeatable demo author and two posts:

```bash
npm run prisma:deploy
npm run prisma:generate
npm run db:seed
npm start
```

For local schema development, use `npm run prisma:migrate -- --name describe_change`. To format or validate the schema, run `npm run prisma:format` and `npm run prisma:validate`.

## API

- `GET /posts` lists posts in ID order.
- `GET /posts/:id` reads a post or returns the existing 404 response.
- `POST /posts` creates a post; provide `title` and a valid `authorId` (the seed creates author `1`). `body` defaults to an empty string.
- `PATCH /posts/:id` updates `title` and/or `body`; a missing post remains a 404.
- `DELETE /posts/:id` removes a post; a missing post remains a 404.

Duplicate and invalid-reference database constraints map to safe 409 and 422 responses. Unexpected infrastructure errors return a generic 500 message rather than raw database details.

The migration lives under `prisma/migrations`. The seed uses upserts and can be run repeatedly without duplicating the demo records. Do not add platform-only question, answer, test, or spec files to this assignment directory.
