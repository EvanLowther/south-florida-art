import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
  if (amount > 100000) {
    return { valid: false, error: 'Maximum donation is $1,000' }
  }
  return { valid: true }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:5173'

    if (!stripeSecretKey) {
      console.error('Stripe secret key not configured')
      return new Response(
        JSON.stringify({ error: 'Payment processing not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    return new Response(
      JSON.stringify({
        success: true,
        url: session.url
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Stripe error:', error)
    return new Response(
      JSON.stringify({ error: 'Payment processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})