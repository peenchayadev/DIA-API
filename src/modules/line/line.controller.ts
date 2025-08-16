import Elysia from "elysia"
import { lineWebhook } from "../../plugins/verifySignature.plugin"
import { handleLineEvents } from "./line.service";

export const lineRouter = new Elysia({ prefix: '/line' })
  .use(lineWebhook(
    { channelSecret: process.env.LINE_CHANNEL_SECRET }))
  .post('/webhook', 
    async ({ body }) => {
      const events = body.events

      await Promise.all(
        events.map(async (event : any) => {
          await handleLineEvents(event)
        })
      )

      return { message: 'OK' }
    }
  );