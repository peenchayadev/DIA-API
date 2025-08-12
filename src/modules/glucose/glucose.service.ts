import dayjs from 'dayjs'
import { prisma } from '../../prisma/client'

export enum GlucoseLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL', 
  HIGH = 'HIGH'
}

export interface GlucoseSummary {
  measurementCount: number
  latestLevel: {
    value: number
    status: GlucoseLevel
    recordedAt: Date
  } | null
  average: number | null
  minimum: number | null
  maximum: number | null
  date: string
}

function getGlucoseStatus(value: number, targetMin: number = 80, targetMax: number = 180): GlucoseLevel {
  if (value <= targetMin) {
    return GlucoseLevel.LOW
  } else if (value >= targetMax) {
    return GlucoseLevel.HIGH
  } else {
    return GlucoseLevel.NORMAL
  }
}

export async function getTodayGlucoseSummary(lineUserId: string): Promise<GlucoseSummary> {
  // Get user from database
  const user = await prisma.user.findUnique({
    where: { lineUserId },
    include: {
      settings: true
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  // Get today's date range (00:00 - 23:59)
  const today = dayjs()
  const startOfDay = today.startOf('day').toDate()
  const endOfDay = today.endOf('day').toDate()

  // Get all glucose logs for today
  const todayLogs = await prisma.glucoseLog.findMany({
    where: {
      userId: user.id,
      recordedAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    orderBy: {
      recordedAt: 'desc'
    }
  })

  // Calculate summary
  const measurementCount = todayLogs.length
  
  let latestLevel = null
  let average = null
  let minimum = null
  let maximum = null

  if (todayLogs.length > 0) {
    // Latest measurement
    const latest = todayLogs[0]
    const targetMin = user.settings?.targetMin || 80
    const targetMax = user.settings?.targetMax || 180
    
    latestLevel = {
      value: latest?.value || 0,
      status: getGlucoseStatus(latest?.value || 0, targetMin, targetMax),
      recordedAt: latest?.recordedAt || new Date()
    }

    // Calculate statistics
    const values = todayLogs.map(log => log.value)
    average = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length)
    minimum = Math.min(...values)
    maximum = Math.max(...values)
  }

  return {
    measurementCount,
    latestLevel,
    average,
    minimum,
    maximum,
    date: today.format('YYYY-MM-DD')
  }
}
