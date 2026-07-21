import { NextRequest, NextResponse } from 'next/server';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3000/api/v1/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${AUTH_API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      return NextResponse.json(json, { status: res.status });
    }

    const { accessToken, refreshToken, user } = json.data;

    const response = NextResponse.json({ success: true, data: { accessToken, user } });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
