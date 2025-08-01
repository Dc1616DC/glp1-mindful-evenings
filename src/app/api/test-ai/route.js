import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const GROK_API_KEY = process.env.GROK_API_KEY;
    const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
    
    console.log('GROK_API_KEY available:', !!GROK_API_KEY);
    console.log('GROK_API_KEY length:', GROK_API_KEY?.length || 0);
    
    if (!GROK_API_KEY) {
      return NextResponse.json({ 
        error: 'GROK_API_KEY not found',
        env: Object.keys(process.env).filter(key => key.includes('GROK'))
      });
    }
    
    // Test simple API call
    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Hello, can you respond with just "AI working"?'
          }
        ],
        model: 'grok-2-1212',
        temperature: 0.1,
        max_tokens: 10
      })
    });
    
    console.log('Grok API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Grok API error:', errorText);
      return NextResponse.json({ 
        error: 'API call failed',
        status: response.status,
        details: errorText
      });
    }
    
    const data = await response.json();
    return NextResponse.json({ 
      success: true,
      response: data.choices[0].message.content
    });
    
  } catch (error) {
    console.error('Test AI error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    });
  }
}