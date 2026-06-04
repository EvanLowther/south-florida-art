import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function verifyAdmin(req: Request): Promise<{ id: string; email: string | undefined }> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header')
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new AuthError('Unauthorized')
  }

  const userEmail = user.email?.toLowerCase()
  if (!userEmail) {
    throw new AuthError('No email on account')
  }

  const adminEmails = (Deno.env.get('ADMIN_EMAILS') || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
    throw new AuthError('Not authorized as admin')
  }

  return { id: user.id, email: user.email }
}
