import jwt from 'jsonwebtoken'
import { prisma } from '../../prisma/client'

interface LineUserProfile {
  userId: string
  displayName: string
  pictureUrl?: string
  statusMessage?: string
}

export async function verifyLineToken(idToken: string): Promise<LineUserProfile | null> {
  try {
    const decoded = jwt.decode(idToken) as any

    if (!decoded) {
      console.error('Failed to decode LIFF ID token')
      return null
    }

    const now = Math.floor(Date.now() / 1000)
    const isExpired = decoded.exp < now
    const timeUntilExpiry = decoded.exp - now
    
    console.log(`Token validation - Current: ${now}, Expires: ${decoded.exp}, Expired: ${isExpired}`)
    
    if (decoded.exp && isExpired) {
      console.error('LIFF ID token is expired')
      return null
    }
    
    if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
      console.warn(`⚠️  Token will expire in ${Math.floor(timeUntilExpiry / 60)} minutes`)
    }

    if (!decoded.sub || !decoded.name) {
      console.error('Missing required fields in LIFF ID token', { sub: decoded.sub, name: decoded.name })
      return null
    }

    if (decoded.iss !== 'https://access.line.me') {
      console.error('Invalid issuer in LIFF ID token', { expected: 'https://access.line.me', got: decoded.iss })
      return null
    }

    const channelId = process.env.LINE_CHANNEL_ID || '2007170340'
    
    if (decoded.aud !== channelId) {
      return null
    }

    const lineUser: LineUserProfile = {
      userId: decoded.sub,
      displayName: decoded.name,
      pictureUrl: decoded.picture
    }

    const dbUser = await prisma.user.upsert({
      where: { lineUserId: lineUser.userId },
      create: { lineUserId: lineUser.userId },
      update: {}
    })

    return lineUser

  } catch (error) {
    console.error('Error verifying LIFF ID token:', error)
    return null
  }
}

export async function generateJWT(lineUserId: string, displayName: string): Promise<string> {
  const payload = {
    lineUserId,
    displayName,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }

  const secret = process.env.APP_JWT_SECRET || 'your-secret-key'
  
  return jwt.sign(payload, secret)
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    const secret = process.env.APP_JWT_SECRET || 'your-secret-key'
    const decoded = jwt.verify(token, secret) as any
    
    if (!decoded.lineUserId) {
      console.error('Invalid JWT: missing lineUserId')
      return null
    }
    
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = decoded.exp - now
    
    if (timeUntilExpiry < 3600) {
      console.warn(`JWT token will expire in ${Math.floor(timeUntilExpiry / 60)} minutes`)
    }
    
    return decoded
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.error('JWT token is expired')
    } else if (error.name === 'JsonWebTokenError') {
      console.error('Invalid JWT token')
    } else {
      console.error('JWT verification error:', error.message)
    }
    return null
  }
}
