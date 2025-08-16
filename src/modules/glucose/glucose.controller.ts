import Elysia, { t } from "elysia"
import { verifyJWT } from "../auth/auth.service"
import { getBearerToken } from "../../utils/getBearerToken"
import { getTodayGlucoseSummary, getTodayGlucoseReadings } from "./glucose.service"

export const glucoseRouter = new Elysia({ prefix: '/glucose' })
  .get('/summary/today', 
    async ({ headers, set }) => {
      try {
        // Get and verify JWT token
        const token = getBearerToken(headers.authorization)
        if (!token) {
          set.status = 401
          return { error: 'Authorization token required' }
        }

        const decoded = await verifyJWT(token)
        if (!decoded) {
          set.status = 401
          return { error: 'Invalid or expired token' }
        }

        const lineUserId = decoded.lineUserId

        // Get today's glucose summary
        const summary = await getTodayGlucoseSummary(lineUserId)

        return {
          success: true,
          data: summary
        }
      } catch (error) {
        console.error('Error getting glucose summary:', error)
        set.status = 500
        return { error: 'Internal server error' }
      }
    }
  )
  .get('/today',
    async ({ headers, set }) => {
      try {
        // Get and verify JWT token
        const token = getBearerToken(headers.authorization)
        if (!token) {
          set.status = 401
          return { error: 'Authorization token required' }
        }

        const decoded = await verifyJWT(token)
        if (!decoded) {
          set.status = 401
          return { error: 'Invalid or expired token' }
        }

        const lineUserId = decoded.lineUserId

        // Get today's glucose readings
        const readings = await getTodayGlucoseReadings(lineUserId)

        return {
          success: true,
          data: readings
        }
      } catch (error) {
        console.error('Error getting glucose readings:', error)
        set.status = 500
        return { error: 'Internal server error' }
      }
    }
  )
