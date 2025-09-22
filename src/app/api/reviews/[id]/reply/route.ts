import { NextResponse } from 'next/server';

// This project uses an external backend for review replies.
// Please call POST /reviews/reply on the backend directly from the client.
export async function POST() {
  return NextResponse.json(
    { message: 'This route is disabled. Use POST /reviews/reply on the backend.' },
    { status: 410 }
  );
}
