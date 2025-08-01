import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { getUserProfile } = await import('../../../../lib/userService');
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const { data, error } = await getUserProfile(userId);
    
    return NextResponse.json({
      success: !error,
      userProfile: data,
      error: error
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}