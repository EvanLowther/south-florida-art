import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { verifyAdmin, AuthError } from '../_shared/admin-auth.ts'

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    await verifyAdmin(req)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { id1, id2 } = await req.json()

    if (!id1 || !id2) {
      return new Response(JSON.stringify({ error: 'Missing event ids' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch both events
    const { data: events, error: fetchError } = await supabase
      .from('events')
      .select('id, sort_order')
      .in('id', [id1, id2])

    if (fetchError || !events || events.length !== 2) {
      return new Response(JSON.stringify({ error: 'Events not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const event1 = events.find(e => e.id === id1)!
    const event2 = events.find(e => e.id === id2)!

    // Swap sort_orders
    const { error: update1 } = await supabase
      .from('events')
      .update({ sort_order: event2.sort_order, updated_at: new Date().toISOString() })
      .eq('id', id1)

    const { error: update2 } = await supabase
      .from('events')
      .update({ sort_order: event1.sort_order, updated_at: new Date().toISOString() })
      .eq('id', id2)

    if (update1 || update2) {
      console.error('Swap errors:', update1, update2)
      return new Response(JSON.stringify({ error: 'Failed to reorder events' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    console.error('Function error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
