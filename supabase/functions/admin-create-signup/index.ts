import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { event_id, first_name, last_name, email } = await req.json()

    if (!event_id || !first_name || !last_name || !email) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const trimmedFirstName = first_name.trim().slice(0, 100)
    const trimmedLastName = last_name.trim().slice(0, 100)
    const trimmedEmail = email.trim().slice(0, 320).toLowerCase()

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the event exists and has signups enabled
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, has_signup_button')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: 'Event not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!event.has_signup_button) {
      return new Response(JSON.stringify({ error: 'Signups are not enabled for this event.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await supabase
      .from('event_signups')
      .insert({
        event_id,
        first_name: trimmedFirstName,
        last_name: trimmedLastName,
        email: trimmedEmail,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({ error: 'Failed to submit signup.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
