export type AnalysisLogging = {
  type: 'logging'
  value: number
  timing: string
}

export type AnalysisQuestion = {
  type: 'question'
  query: string
}

export type AnalysisUnknown = {
  type: 'unknown'
}

export type AnalysisResult = AnalysisLogging | AnalysisQuestion | AnalysisUnknown

export type AppUser = {
  id: number
  lineUserId: string
}

type FoodAnalysis = {
  image_type: 'food'
  food_name: string
  estimated_glucose: string
  estimated_carbs: string
  recommendation: string
}

type LabResultAnalysis = {
  image_type: 'lab_result'
  fasting_glucose: number
  hba1c: number
  normal_range_min: number
  normal_range_max: number
  normal_range_unit: string
  hba1c_unit: string
  record_date: string
}

type AppointmentSlipAnalysis = {
  image_type: 'appointment_slip'
  appointment_date: string | null
  start_time: string | null
  end_time: string | null
  doctor_name: string | null
  full_name: string | null
  age: string | null
  reason: string | null
  hospital_name: string | null
  details: string | null
}

type OtherAnalysis = { image_type: 'other' }
type ErrorAnalysis = { image_type: 'error' }

export type ImagesResult =
  | FoodAnalysis
  | LabResultAnalysis
  | AppointmentSlipAnalysis
  | OtherAnalysis
  | ErrorAnalysis