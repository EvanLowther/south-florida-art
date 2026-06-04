import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'
import { verifyAdmin, AuthError } from '../_shared/admin-auth.ts'

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    await verifyAdmin(req)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, ...params } = await req.json()

    switch (action) {
      case 'check': {
        return new Response(JSON.stringify({ admin: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'get_inquiries': {
        const { data, error } = await supabase
          .from('instrument_inquiries')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'get_subscriptions': {
        const { data, error } = await supabase
          .from('newsletter_subscriptions')
          .select('*')
          .order('subscribed_at', { ascending: false })
        if (error) throw error
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'get_donations': {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'get_signups': {
        const { data, error } = await supabase
          .from('event_signups')
          .select('*')
          .order('created_at', { ascending: false })
        if (error) throw error
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'get_events': {
        const { data, error } = await supabase
          .from('events')
          .select('id, title')
          .eq('has_signup_button', true)
          .order('sort_order', { ascending: true })
        if (error) throw error
        return new Response(JSON.stringify({ data }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'update_inquiry_status': {
        const { id, status } = params
        if (!id || !status) {
          return new Response(JSON.stringify({ error: 'Missing id or status' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        const { error } = await supabase
          .from('instrument_inquiries')
          .update({ status })
          .eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'delete_inquiry': {
        const { id } = params
        if (!id) {
          return new Response(JSON.stringify({ error: 'Missing id' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        const { error } = await supabase
          .from('instrument_inquiries')
          .delete()
          .eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      case 'delete_subscription': {
        const { id } = params
        if (!id) {
          return new Response(JSON.stringify({ error: 'Missing id' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        const { error } = await supabase
          .from('newsletter_subscriptions')
          .delete()
          .eq('id', id)
        if (error) throw error
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
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
