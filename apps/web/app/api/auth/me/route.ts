import { NextRequest, NextResponse } from 'next/server';

const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API || 'http://localhost:3000/api/v1/auth';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      return NextResponse.json({ success: false, message: 'No authorization header' }, { status: 401 });
    }

    const res = await fetch(`${AUTH_API}/me`, {
      headers: { Authorization: authorization },
    });

    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
