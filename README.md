# t3 websocket minimal

This example uses `app router` and clerk.

Install dependencies:
```bash
pnpm install
```

Replace these environment variables in `.env`
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

To run the application locally run the following command:
`pnpm run dev`

## Inspired by

- https://github.com/TomDoesTech/t3-chat
  - for the chat room
- https://github.com/trpc/examples-next-prisma-websockets-starter
  - for the web socket setup in a dev server
- https://github.com/vercel/next.js/discussions/58698#discussioncomment-7655962
  - for the web socket config (wssServer)

## Important points:

- The websocket connection is not secure, thats why the `onSendMessage` endpoint does not contain the message.
  - I did not manage to secure it with clerk
- Because two connections are needed, a `splitLink` in trpc will distinguish the calls.
- The `TypedEventEmitter` must be stored globally to ensure that the websocket and normal communication can interact with each other
- This setup probably does not work with Vercel (have not tried it, as I need the standalone version): https://github.com/vercel/next.js/discussions/58698#discussioncomment-7655962


