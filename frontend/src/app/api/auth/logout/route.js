import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('loz_token');
  response.cookies.delete('loz_refresh_token');
  return response;
}
