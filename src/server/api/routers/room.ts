import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { observable } from "@trpc/server/observable";

const sendMessageSchema = z.object({
  roomId: z.string(),
  message: z.string(),
  name: z.string(),
});

const messageSchema = z.object({
  id: z.string(),
  message: z.string(),
  roomId: z.string(),
  sentAt: z.date(),
  sender: z.object({
    name: z.string(),
  }),
});

type Message = z.TypeOf<typeof messageSchema>;

const messageSubSchema = z.object({
  roomId: z.string(),
});

declare module "~/lib/event-emitter" {
  interface KnownEvents {
    SEND_MESSAGE: Message;
  }
}

export const roomRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(sendMessageSchema)
    .mutation(({ctx, input}) => {
      const message: Message = {
        id: randomUUID(),
        ...input,
        sentAt: new Date(),
        sender: {
          name: input.name
        },
      };

      ctx.ee.emit('SEND_MESSAGE', message);

      return message;
    }),
    
});