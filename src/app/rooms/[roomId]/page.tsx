"use client";
import { SignIn, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { api } from "~/trpc/react";
import { type RouterOutputs } from "~/trpc/shared";

type Message = RouterOutputs["room"]["sendMessage"];

function MessageItem({ message, name }: { message: Message; name: string }) {
  const baseStyles =
    "mb-4 text-md w-7/12 p-4 text-gray-700 border border-gray-700 rounded-md";

  const liStyles =
    message.sender.name === name
      ? baseStyles
      : baseStyles.concat(" self-end bg-gray-700 text-white");

  return (
    <li className={liStyles}>
      <div className="flex">
        <time>
          {message.sentAt.toLocaleTimeString("en-AU", {
            timeStyle: "short",
          })}{" "}
          - {message.sender.name}
        </time>
      </div>
      {message.message}
    </li>
  );
}

function RoomPage({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
  const { user } = useUser();

  const [message, setMessage] = useState("");
  const sendMessage = api.room.sendMessage.useMutation({});
  const getMessage = api.room.getMessage.useMutation({
    onSuccess(data) {
      setMessages((m) => {
        return [...m, data];
      });
    },
  });

  const [messages, setMessages] = useState<Message[]>([]);
  api.room.onSendMessage.useSubscription(
    { roomId },
    {
      onData: (message) => getMessage.mutate(message),
    },
  );

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="flex h-screen flex-col">
      <UserButton />
      <div className="flex-1">
        <ul className="flex flex-col p-4">
          {messages.map((m) => {
            return (
              <MessageItem
                key={m.id}
                message={m}
                name={`${user.firstName} ${user.lastName}`}
              />
            );
          })}
        </ul>
      </div>

      <form
        className="flex"
        onSubmit={(e) => {
          console.log("submity");
          e.preventDefault();

          sendMessage.mutate({
            roomId,
            message,
          });

          setMessage("");
        }}
      >
        <textarea
          className="black w-full rounded-md border border-gray-700 bg-gray-50 p-2.5 text-gray-700"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want to say"
        />

        <button className="flex-1 bg-gray-900 p-2.5 text-white" type="submit">
          Send message
        </button>
      </form>
    </div>
  );
}

export default RoomPage;
