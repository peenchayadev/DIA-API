import dayjs from 'dayjs'
import { prisma } from '../../prisma/client'
import type { WebhookEvent } from '@line/bot-sdk'
import { lineClient, replyMessage } from './line.client'
import { 
	analyzeImage, 
	analyzeTextFromUser, 
	getDiabetesAnswer, 
	transcribeAudioWithGoogle 
} from '../gemini/gemini.service'
import { toHumanTiming, toNum } from '../../utils/globals'
import type { AnalysisQuestion, AnalysisResult, AppUser } from './line.type'
import { UploadImage } from '../../utils/storage'

async function handleLogging(analysis: any, replyToken: string, user: any) {
	try {
		const created = await prisma.glucoseLog.create({
			data: {
				recordedAt: new Date(),
				userId: user.id,
				value: analysis.value,
				period: analysis.timing
			}
		})
		if (!created) {
			await replyMessage(replyToken, 'ขออภัยค่ะ เกิดข้อผิดพลาดในการบันทึกข้อมูล โปรดลองอีกครั้งนะคะ')
			return
		}

		await replyMessage(replyToken, `บันทึกค่าน้ำตาล ${analysis.value} ช่วง ${toHumanTiming(analysis.timing)} สำเร็จค่ะ! 👍`)
	} catch (err) {
		console.error('handleLogging error:', err)
		await replyMessage(replyToken, 'ขออภัยค่ะ เกิดข้อผิดพลาดในการบันทึกข้อมูล')
	}
}

async function handleQuestion(analysis: AnalysisQuestion, replyToken: string) {
	try {
		const answer = await getDiabetesAnswer(analysis.query)
		await replyMessage(replyToken, answer || 'ขออภัยค่ะ ไม่พบคำตอบที่เหมาะสม')
	} catch (err) {
		console.error('handleQuestion error:', err)
		await replyMessage(replyToken, 'ขออภัยค่ะ เกิดข้อผิดพลาดในการค้นหาคำตอบ')
	}
}

async function handleTextMessageLogic(analysis: AnalysisResult, replyToken: string, user: AppUser) {
	switch (analysis.type) {
		case 'logging':
			return handleLogging(analysis, replyToken, user)
		case 'question':
			return handleQuestion(analysis, replyToken)
		case 'unknown':
		default:
			return replyMessage(replyToken, 'ขออภัยค่ะ ฉันไม่เข้าใจข้อความของคุณ โปรดส่งข้อมูลเกี่ยวกับเบาหวานนะคะ')
	}
}

export async function handleLineEvents(event: WebhookEvent) {
	if (!('replyToken' in event) || !event.source?.userId) return null
	if (event.type !== 'message') return null

	console.log('Received message event:', event)

	const lineUserId = event.source.userId
	const replyToken = event.replyToken

	try {
		const user = (await prisma.user.upsert({
			where: { lineUserId },
			create: { lineUserId },
			update: {}
		})) as AppUser

		switch (event.message.type) {
			case 'text':
				const analysis = await analyzeTextFromUser(event.message.text)
				await handleTextMessageLogic(analysis, replyToken, user)
				break
			case 'audio':
				const audioBuffer = await lineClient.getMessageContent(event.message.id)
				const transcribedText = await transcribeAudioWithGoogle(audioBuffer)
				if (transcribedText) {
					const textAnalysis = await analyzeTextFromUser(transcribedText)
					await handleTextMessageLogic(textAnalysis, replyToken, user)
				} else {
					await replyMessage(replyToken, 'ขออภัยค่ะ เกิดข้อผิดพลาดในการแปลเสียงเป็นข้อความ')
				}
				break
			case 'image': {
				const imageBuffer = await lineClient.getMessageContent(event.message.id)
				const imageAnalysis = await analyzeImage(imageBuffer)

				switch (imageAnalysis.image_type) {
					case 'food': {
						const foodImageUrl = await UploadImage(imageBuffer, user.id)
						await prisma.foodAnalysis.create({
							data: {
								user: { connect: { id: user.id } },
								foodName: imageAnalysis.food_name ?? null,
								carbsGram: toNum(imageAnalysis.estimated_carbs),
								sugarGram: toNum(imageAnalysis.estimated_glucose),
								advice: imageAnalysis.recommendation ?? null,
								media: {
									create: [{ url: foodImageUrl }]
								}
							}
						})

						const foodReply =
							`🥗 วิเคราะห์รูปภาพ:\n\n` +
							`ชื่ออาหาร: ${imageAnalysis.food_name}\n` +
							`คาร์โบไฮเดรตประมาณ: ${imageAnalysis.estimated_carbs}\n\n` +
							`คำแนะนำ: ${imageAnalysis.recommendation}`

						await replyMessage(replyToken, foodReply)
						break
					}

					case 'lab_result': {
						if (imageAnalysis.fasting_glucose || imageAnalysis.hba1c) {
							const labImageUrl = await UploadImage(imageBuffer, user.id)
							await prisma.labResult.create({
								data: {
									user: { connect: { id: user.id } },
									fastingGlucose: imageAnalysis.fasting_glucose,
									hba1c: imageAnalysis.hba1c,
									normalRangeMin: imageAnalysis.normal_range_min,
									normalRangeMax: imageAnalysis.normal_range_max,
									fastingGlucoseUnit: imageAnalysis.normal_range_unit,
									hba1cUnit: imageAnalysis.hba1c_unit,
									recordDate: imageAnalysis.record_date ? new Date(imageAnalysis.record_date) : new Date(),
									media: {
										create: [{ url: labImageUrl }]
									}
								}
							})
							await replyMessage(replyToken, 'บันทึกข้อมูลผลตรวจเลือดของคุณเรียบร้อยแล้วค่ะ 🩺')
						} else {
							await replyMessage(replyToken, 'ขออภัยค่ะ ฉันไม่สามารถหาข้อมูลค่าน้ำตาลหรือค่า HbA1c จากรูปภาพนี้ได้')
						}
						break
					}
					case 'appointment_slip': {
						if (imageAnalysis.appointment_date) {
							const appointmentImageUrl = await UploadImage(imageBuffer, user.id)
							await prisma.appointment.create({
								data: {
									user: { connect: { id: user.id } },
									appointmentDate: new Date(imageAnalysis.appointment_date),
									fullName: imageAnalysis.full_name ?? null,
									age: imageAnalysis.age ?? null,
									doctorName: imageAnalysis.doctor_name ?? null,
									hospitalName: imageAnalysis.hospital_name ?? null,
									startTime: imageAnalysis.start_time ?? null,
									reason: imageAnalysis.reason ?? null,
									endTime: imageAnalysis.end_time ?? null,
									details: imageAnalysis.details ?? null,
									media: {
										create: [{ url: appointmentImageUrl }]
									}
								}
							})

							const displayDate = dayjs(imageAnalysis.appointment_date).format('DD/MM/YYYY')
							const displayStartTime = imageAnalysis.start_time
							const displayEndTime = imageAnalysis.end_time

							await replyMessage(
								replyToken,
								`บันทึกนัดหมายวันที่ ${displayDate} เวลา ${displayStartTime} - ${displayEndTime} น. เรียบร้อยแล้วค่ะ 🗓️`
							)
						} else {
							await replyMessage(replyToken, 'ขออภัยค่ะ ฉันไม่สามารถหาข้อมูลวันที่และเวลาที่ชัดเจนจากใบนัดนี้ได้')
						}
						break
					}

					default: {
						await replyMessage(replyToken, 'ขออภัยค่ะ ฉันไม่สามารถประมวลผลรูปภาพนี้ได้ ลองส่งภาพอาหาร ผลตรวจเลือดหรือ ใบนัดหมายใหม่นะคะ')
					}
				}
				break
			}
		}
	} catch (error) {
		console.error('An error occurred in handleEvent:', error)
		return replyMessage(replyToken, 'ขออภัยค่ะ ระบบเกิดข้อผิดพลาด โปรดลองอีกครั้งในภายหลัง')
	}
}
