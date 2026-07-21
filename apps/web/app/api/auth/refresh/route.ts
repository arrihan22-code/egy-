import { NextRequest, NextResponse } from 'next/server';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3000/api/v1/auth';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ success: false, message: 'No refresh token' }, { status: 401 });
    }

    const res = await fetch(`${AUTH_API}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const json = await res.json();

    if (!res.ok) {
      const response = NextResponse.json(json, { status: res.status });
      response.cookies.delete('refreshToken');
      return response;
    }

    const { accessToken, refreshToken: newRefreshToken, user } = json.data;

    const response = NextResponse.json({ success: true, data: { accessToken, user } });

    response.cookies.set('refreshToken', newRefreshToken, {
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
