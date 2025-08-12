export function getBearerToken(h?: string | null) {
  if (!h) return undefined
  const [type, token] = h.split(' ')
  if (!type || !token) return undefined
  if (type.toLowerCase() !== 'bearer') return undefined
  return token
}