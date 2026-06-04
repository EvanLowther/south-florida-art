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

    const { id, title, date, description, location, image_url, has_signup_button } = await req.json()

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing event id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const updates: Record<string, string | boolean> = {}
    if (title !== undefined) {
      const t = title.trim()
      if (t.length > 255) {
        return new Response(JSON.stringify({ error: 'Title exceeds 255 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      updates.title = t
    }
    if (date !== undefined) updates.date = date.trim().slice(0, 100)
    if (description !== undefined) {
      const d = description.trim()
      if (d.length > 2000) {
        return new Response(JSON.stringify({ error: 'Description exceeds 2000 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      updates.description = d
    }
    if (location !== undefined) {
      const l = location.trim()
      if (l.length > 500) {
        return new Response(JSON.stringify({ error: 'Location exceeds 500 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      updates.location = l
    }
    if (image_url !== undefined) {
      const trimmedUrl = image_url.trim()
      const validImageRegex = /^data:image\/(jpeg|png|webp|gif);base64,/
      if (!validImageRegex.test(trimmedUrl)) {
        console.error('Invalid image format. Received prefix:', trimmedUrl.substring(0, 60))
        return new Response(JSON.stringify({ error: 'Invalid image format. Accepted: JPEG, PNG, WebP, GIF' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const maxBase64Size = 5 * 1024 * 1024
      if (trimmedUrl.length > maxBase64Size) {
        return new Response(JSON.stringify({ error: 'Image too large after encoding. Please use a smaller image.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      updates.image_url = trimmedUrl
    }
    if (has_signup_button !== undefined) {
      updates.has_signup_button = has_signup_button
    }
    updates.updated_at = new Date().toISOString()

    if (Object.keys(updates).length <= 1) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(JSON.stringify({ error: 'Failed to update event' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
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
