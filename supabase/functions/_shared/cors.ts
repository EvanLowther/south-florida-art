const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://south-florida-art.vercel.app',
]

const CORS_HEADERS_BASE = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    ...CORS_HEADERS_BASE,
    'Access-Control-Allow-Origin': allowed,
  }
}
