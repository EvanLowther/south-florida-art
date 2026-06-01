import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { checkRateLimit, RATE_LIMITS, getClientIp } from '../_shared/rate-limiter.ts'

interface RequestBody {
  amount: number
}

function validateAmount(amount: number): { valid: boolean; error?: string } {
  if (!amount || typeof amount !== 'number') {
    return { valid: false, error: 'Invalid amount' }
  }
  if (amount < 50) {
    return { valid: false, error: 'Minimum donation is $0.50' }
  }
  if (amount > 99999999) {
    return { valid: false, error: 'Maximum donation is $999,999.99' }
  }
  return { valid: true }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const ip = getClientIp(req)
  const rateCheck = await checkRateLimit(supabaseUrl, supabaseServiceKey, ip, 'create-payment-intent', RATE_LIMITS.PAYMENT.maxRequests, RATE_LIMITS.PAYMENT.windowMs)
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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:5173'

    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured')
      return new Response(
        JSON.stringify({ error: 'Payment processing not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const stripe = new Stripe(stripeSecretKey, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body: RequestBody = await req.json()
    const { amount } = body

    const validation = validateAmount(amount)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to South Florida Arts Foundation',
              description: 'Your donation helps provide instruments to students in need',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/donate?success=true`,
      cancel_url: `${baseUrl}/donate?cancelled=true`,
      metadata: {
        source: 'south_florida_arts_foundation',
      },
    })

    // Insert pending donation record
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { error: insertError } = await supabase
      .from('donations')
      .insert({
        stripe_session_id: session.id,
        amount,
        status: 'pending',
      })

    if (insertError) {
      console.error('Failed to insert pending donation:', insertError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    console.error('Stripe error:', error)
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
