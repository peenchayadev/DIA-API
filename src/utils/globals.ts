
export function toHumanTiming (timing: string) :string {
  return timing.replaceAll('_', ' ').toLowerCase()
}

export function toNum  (v: unknown): number | null  {
  if (v === null || v === undefined) return null
  const n = typeof v === 'number' ? v : Number(String(v).replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : null
}
