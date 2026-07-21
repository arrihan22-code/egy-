import { NextRequest, NextResponse } from 'next/server';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3000/api/v1/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (refreshToken) {
      await fetch(`${AUTH_API}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {}

  const response = NextResponse.json({ success: true });
  response.cookies.delete('refreshToken');
  return response;
}
