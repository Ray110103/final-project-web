import { NextResponse } from 'next/server';

// This project uses an external backend for property reviews.
// Please call GET /reviews/property/:id on the backend from the client.
export async function GET() {
  return NextResponse.json(
    { message: 'This route is disabled. Use GET /reviews/property/:id on the backend.' },
    { status: 410 }
  );
}
