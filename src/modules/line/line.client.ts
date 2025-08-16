import { Client } from '@line/bot-sdk'

export const lineClient = new Client({
	channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!
})

export async function replyMessage(replyToken: string, text: string) {
	try {
		await lineClient.replyMessage(replyToken, [{ type: 'text', text: text }])
	} catch (error) {
		console.error(`Failed to reply message:`, error)
	}
}