import Elysia from 'elysia'
import { verifySignatureFn } from '../utils/verifySignatureLine'

interface LineWebhookOptions {
  channelSecret?: string
}

export const lineWebhook = (options: LineWebhookOptions = {}) =>
  new Elysia()
    .derive(({ error }) => ({
      verifySignature: verifySignatureFn
    }))
    .onTransform(({ body, headers, error, verifySignature }) => {
      const signature = headers['x-line-signature']
      const secret = options.channelSecret

      if (secret && signature) {
        verifySignatureFn(body as any, signature, error)(secret)
      }
    })
