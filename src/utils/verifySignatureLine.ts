import { createHmac } from 'node:crypto'
import type { WebhookRequestBody } from '@line/bot-sdk'
import type { error } from 'elysia'

export const verifySignatureFn =
  (body: WebhookRequestBody, signature: string, err: typeof error) =>
  (secret: string, throwIfError: boolean = true) => {
    
    const isValidBody = body && 'destination' in body && 'events' in body
    if (!(isValidBody && Array.isArray(body.events))) {
      throw err(422, { message: 'Invalid request body' })
    }

    if (!secret) {
      throw err(401, { message: 'Channel Secret not provided' })
    }

    if (!signature) {
      throw err(401, { message: 'Signature not provided' })
    }
    

    const hash = createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('base64')

    const isValid = hash === signature

    if (!isValid && throwIfError) {
      throw err(401, { message: 'Invalid signature' })
    }

    return isValid
  }