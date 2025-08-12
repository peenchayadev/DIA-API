import Elysia, { t } from "elysia"
import { generateJWT, verifyLineToken } from "./auth.service"

export const authRouter = new Elysia({ prefix: '/auth' })
  .post('/line-verify', 
    async ({ body, set }) => {
      try {
        const { accessToken } = body
        const lineUser = await verifyLineToken(accessToken)

        
        if (!lineUser) {
          set.status = 401
          return { 
            success: false,
            error: 'Invalid or expired LINE ID token. Please login again.' 
          }
        }

        const jwt = await generateJWT(lineUser.userId, lineUser.displayName)

        return {
          success: true,
          data: {
            jwt,
            user: {
              lineUserId: lineUser.userId,
              displayName: lineUser.displayName,
              pictureUrl: lineUser.pictureUrl
            }
          }
        }
      } catch (error) {
        console.error('LINE token verification error:', error)
        set.status = 500
        return { 
          success: false,
          error: 'Internal server error. Please try again.' 
        }
      }
    },
    {
      body: t.Object({
        accessToken: t.String()
      })
    }
  )
