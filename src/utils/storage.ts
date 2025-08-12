import { Readable } from 'node:stream'
import { buffer as streamToBuffer } from 'node:stream/consumers'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../supabase/client'

type ImageInput = Buffer | Readable

export async function UploadImage(
  input: ImageInput,
  userId: number,
  opts?: { mimeType?: string; ext?: string; upsert?: boolean }
): Promise<string> {
  const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'dia-media'
  const mimeType = opts?.mimeType ?? 'image/jpeg'
  const ext = opts?.ext ?? 'jpg'
  const fileName = `${uuidv4()}.${ext}`
  const filePath = `${userId}/${fileName}`

  const imageBuffer = Buffer.isBuffer(input) ? input : await streamToBuffer(input)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, imageBuffer, { contentType: mimeType, upsert: opts?.upsert ?? false })

  if (uploadError) {
    console.error('Error uploading image to storage:', uploadError)
    throw new Error('Could not upload image to storage.')
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath)
  if (!data?.publicUrl) throw new Error('Could not get public URL for the image.')

  console.log('Image uploaded successfully. URL:', data.publicUrl)
  return data.publicUrl
}