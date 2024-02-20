import {
  createWSClient,
  unstable_httpBatchStreamLink,
  wsLink,
} from "@trpc/client";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import type { NextPageContext } from "next";
import superjson from "superjson";
import { env } from "~/env";

import { type AppRouter } from "~/server/api/root";

export const transformer = superjson;

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  return `http://localhost:${env.NEXT_PUBLIC_WS_PORT}`;
}

export function getBatchLink(ctx?: NextPageContext) {
  return unstable_httpBatchStreamLink({
    url: `${getBaseUrl()}/api/trpc`,
    headers() {
      if (!ctx?.req?.headers) {
        return {};
      }
      return {
        ...ctx.req.headers,
        "x-ssr": 1,
      };
    },
  });
}

export function getEndingLink() {
  if (typeof window === "undefined") {
    return getBatchLink();
  }

  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const url = `${protocol}://localhost:${process.env.NEXT_PUBLIC_WS_PORT}`

  return wsLink<AppRouter>({
    client: createWSClient({
      url,
      onClose(cause) {
        console.error("ws closed", cause);
      },
    }),
  });
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
