import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { checkRateLimit, RATE_LIMITS, getClientIp } from '../_shared/rate-limiter.ts'
import { isValidEmail } from '../_shared/email.ts'

const VALID_INSTRUMENT_TYPES = [
  'Electric Guitar', 'Acoustic Guitar', 'Bass Guitar', 'Piano / Keyboard',
  'Violin', 'Viola', 'Cello', 'Double Bass',
  'Flute', 'Clarinet', 'Oboe', 'Bassoon',
  'Alto Saxophone', 'Tenor Saxophone', 'Trumpet', 'French Horn',
  'Trombone', 'Euphonium / Baritone', 'Tuba',
  'Audio Equipment', 'Amplifier',
  'Percussion Kit', 'Snare Drum', 'Marimba / Xylophone',
  'Other',
]

interface RequestBody {
  name: string
  email: string
  instrument_type: string
  condition_description?: string
}

function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input.trim().slice(0, maxLength)
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const ip = getClientIp(req)
  const rateCheck = await checkRateLimit(supabaseUrl, supabaseServiceKey, ip, 'submit-inquiry', RATE_LIMITS.FORM_SUBMIT.maxRequests, RATE_LIMITS.FORM_SUBMIT.windowMs)
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rateCheck.retryAfter) },
      },
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const body: RequestBody = await req.json()

    const { name, email, instrument_type, condition_description } = body

    if (!name || !email || !instrument_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    if (!VALID_INSTRUMENT_TYPES.includes(instrument_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid instrument type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const sanitizedName = sanitizeInput(name, 255)
    const sanitizedEmail = sanitizeInput(email, 255)
    const sanitizedCondition = condition_description ? sanitizeInput(condition_description, 500) : null

    const { data, error } = await supabase
      .from('instrument_inquiries')
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        instrument_type,
        condition_description: sanitizedCondition,
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to submit inquiry' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
