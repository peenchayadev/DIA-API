import jwt from 'jsonwebtoken'

export type AppJwtPayload = {
  userId: number
  lineUserId: string
}

const APP_JWT_SECRET = process.env.APP_JWT_SECRET as string

export function verifyAppToken(token: string) {
  try {
    if (!process.env.APP_JWT_SECRET) {
      console.error('[verifyAppToken] APP_JWT_SECRET missing')
      return null
    }
    const payload = jwt.verify(token, process.env.APP_JWT_SECRET) as AppJwtPayload
    console.log('[verifyAppToken] OK:', { userId: payload.userId, lineUserId: payload.lineUserId })
    return payload
  } catch (e) {
    const err = e as Error
    console.error('[verifyAppToken] FAIL:', err.name, err.message)
    return null
  }
}