import { NextResponse } from 'next/server';

// This project uses an external backend for reviews.
// Please call the backend directly from the client using axiosInstance.
export async function POST() {
  return NextResponse.json(
    { message: 'This route is disabled. Use POST /reviews/create on the backend.' },
    { status: 410 }
  );
}
