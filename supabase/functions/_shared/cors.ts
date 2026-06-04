const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://south-florida-art.vercel.app',
  'https://sofloartsfoundation.org',
  'https://www.sofloartsfoundation.org',
]

const CORS_HEADERS_BASE = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': '*',
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || ''
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ''
  if (!allowed) {
    return { ...CORS_HEADERS_BASE }
  }
  return {
    ...CORS_HEADERS_BASE,
    'Access-Control-Allow-Origin': allowed,
  }
}
