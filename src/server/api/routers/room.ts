import { TRPCError } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const sendMessageSchema = z.object({
  roomId: z.string(),
  message: z.string(),
});

const getMessagesSchema = z.object({
  roomId: z.string(),
  messageId: z.string().uuid(),
});

const messageSchema = z.object({
  id: z.string().uuid(),
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
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  interface KnownEvents {
    [msg: `SEND_MESSAGE_${string}`]: string;
  }
}

// use a database or something more persistent in real life
const messageStore = new Map<string, Message>();

export const roomRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const message: Message = {
        id: randomUUID(),
        ...input,
        sentAt: new Date(),
        sender: {
          name: `${ctx.user.firstName} ${ctx.user.lastName}`,
        },
      };

      messageStore.set(message.id, message);
      ctx.ee.emit(`SEND_MESSAGE_${message.roomId}`, message.id);

      return message;
    }),

  getMessage: protectedProcedure
    .input(getMessagesSchema)
    .mutation(({ input }) => {
      const message = messageStore.get(input.messageId);
      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found",
        });
      }
      return message;
    }),

  onSendMessage: publicProcedure
    .input(messageSubSchema)
    .subscription(({ ctx, input }) => {
      return observable<z.TypeOf<typeof getMessagesSchema>>((emit) => {
        function onMessage(messageId: string) {
          emit.next({ roomId: input.roomId, messageId });
        }

        ctx.ee.on(`SEND_MESSAGE_${input.roomId}`, onMessage);

        return () => {
          ctx.ee.off(`SEND_MESSAGE_${input.roomId}`, onMessage);
        };
      });
    }),
});
