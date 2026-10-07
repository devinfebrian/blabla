import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

function isAuthorized(request: Request): boolean {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return false

  const url = new URL(request.url)
  const provided = url.searchParams.get('secret') ?? request.headers.get('x-revalidate-secret')

  return provided === secret
}

export async function POST(request: Request) {
  if (!process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: 'SANITY_REVALIDATE_SECRET is not configured' },
      { status: 500 },
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  revalidatePath('/')

  return NextResponse.json({ revalidated: true, at: Date.now() })
}
