import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WINDOW_MS = 60_000

export const RATE_LIMITS = {
  FORM_SUBMIT: { maxRequests: 10, windowMs: WINDOW_MS },
  PAYMENT: { maxRequests: 20, windowMs: WINDOW_MS },
  SIGNUP: { maxRequests: 5, windowMs: WINDOW_MS },
} as const

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const ips = forwarded.split(',').map(s => s.trim()).filter(Boolean)
    if (ips.length > 0) return ips[0]
  }
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp
  return 'unknown'
}

export async function checkRateLimit(
  supabaseUrl: string,
  supabaseKey: string,
  ip: string,
  endpoint: string,
  maxRequests: number,
  windowMs: number,
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const supabase = createClient(supabaseUrl, supabaseKey)

  const now = new Date()
  const windowStart = new Date(now.getTime() - windowMs)

  await supabase
    .from('rate_limits')
    .delete()
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .lt('window_start', windowStart.toISOString())

  const { data: existing } = await supabase
    .from('rate_limits')
    .select('request_count, window_start')
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .single()

  if (!existing) {
    const { error } = await supabase
      .from('rate_limits')
      .insert({
        ip_address: ip,
        endpoint,
        request_count: 1,
        window_start: now.toISOString(),
      })
    if (error) console.error('Rate limit insert error:', error)
    return { allowed: true }
  }

  if (new Date(existing.window_start) < windowStart) {
    await supabase
      .from('rate_limits')
      .update({ request_count: 1, window_start: now.toISOString() })
      .eq('ip_address', ip)
      .eq('endpoint', endpoint)
    return { allowed: true }
  }

  if (existing.request_count >= maxRequests) {
    const retryAfter = Math.ceil((new Date(existing.window_start).getTime() + windowMs - now.getTime()) / 1000)
    return { allowed: false, retryAfter: Math.max(1, retryAfter) }
  }

  await supabase
    .from('rate_limits')
    .update({ request_count: existing.request_count + 1 })
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)

  return { allowed: true }
}
