import { NextResponse } from 'next/server';
import { errorLogger } from '../../../../lib/monitoring';

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export async function POST(req) {
  try {
    console.log('API key available:', !!GROK_API_KEY);
    if (!GROK_API_KEY || GROK_API_KEY.trim() === '') {
      console.error('Grok API key not configured');
      return NextResponse.json({ 
        response: 'AI insights are temporarily unavailable. Your check-in has been saved successfully!' 
      });
    }

    const { checkInData, userHistory = [], type = 'insights' } = await req.json();

    let systemPrompt, userPrompt;

    if (type === 'insights') {
      systemPrompt = `You are a compassionate AI assistant specializing in intuitive eating principles and mindful evening routines, specifically designed for GLP-1 medication users navigating the intersection of medication effects and emotional well-being.

CORE INTUITIVE EATING PRINCIPLES TO HONOR:
1. Reject diet mentality - Never suggest restriction or food rules
2. Honor hunger and fullness - Respect body signals, especially with GLP-1 effects
3. Make peace with food - No "good" or "bad" food language
4. Challenge the food police - Counter judgmental thoughts
5. Discover satisfaction in eating - Focus on pleasure and nourishment
6. Feel your feelings without using food - Offer non-food emotional support
7. Respect your body - Promote body acceptance and self-compassion
8. Movement for joy - Suggest gentle, enjoyable activities
9. Gentle nutrition - Health-focused without obsession
10. Honor your health with gentle nutrition - Balanced, sustainable approach

GLP-1 SPECIFIC CONSIDERATIONS:
- Acknowledge appetite changes and nausea as normal medication effects
- Respect that hunger cues may be different while on medication
- Support finding satisfaction even with smaller portions
- Address anxiety about eating less or differently
- Honor both physical and emotional needs during treatment

YOUR RESPONSES MUST:
- Use warm, non-judgmental language rooted in body trust
- Celebrate awareness and curiosity over "perfect" choices
- Offer emotional support that doesn't involve food restriction
- Acknowledge the complexity of eating while on GLP-1 medication
- Reinforce that all bodies and eating experiences are valid
- Keep responses supportive, practical, and under 100 words`;

      const userContext = `Current check-in:
- Last meal: ${checkInData.lastMealTiming}
- Feelings: ${checkInData.feelings.join(', ')}
- Emotional intensity: ${checkInData.emotionalIntensity}/10
- Hunger/fullness: ${checkInData.hungerFullnessLevel}/10
- Route chosen: ${checkInData.routeChosen}
${checkInData.reflectionNotes ? `- Reflection: ${checkInData.reflectionNotes}` : ''}

Recent history: ${userHistory.length} previous check-ins`;

      userPrompt = `${userContext}

Based on this evening check-in, provide:
1. A brief insight about their emotional pattern (1-2 sentences)
2. One specific suggestion for tonight that honors their feelings
3. An encouraging affirmation that reinforces intuitive eating principles

Keep the total response under 100 words and make it feel personal and caring.`;
    } else if (type === 'patterns') {
      systemPrompt = `You are an expert in analyzing emotional eating patterns through the lens of intuitive eating principles, specifically supporting GLP-1 medication users.

ANALYSIS FRAMEWORK:
- Focus on emotional awareness and self-compassion growth
- Identify patterns without shame or judgment
- Celebrate moments of body trust and intuitive choices
- Acknowledge GLP-1 medication effects on hunger/fullness
- Highlight successful non-food emotional coping strategies
- Reinforce that all eating experiences provide valuable information
- Avoid diet-culture language or suggestions for restriction`;
      
      userPrompt = `Analyze these evening check-ins and identify:
1. Most common emotional triggers
2. Times when hunger/fullness awareness was strongest
3. Successful non-food coping strategies used
4. One key pattern to be aware of

Check-ins: ${JSON.stringify(userHistory.slice(0, 10))}

Provide a brief, actionable summary (under 150 words) that empowers rather than criticizes.`;
    } else if (type === 'activity-suggestions') {
      systemPrompt = `You are an expert in intuitive eating-aligned evening self-care activities for GLP-1 medication users. Your suggestions must honor both emotional needs and the principles of body trust and self-compassion.

ACTIVITY SELECTION PRINCIPLES:
- Support emotional processing without using food as comfort or restriction
- Honor the body's need for gentle care, especially with GLP-1 side effects
- Promote activities that increase body awareness and self-connection
- Suggest options that don't require "earning" or "burning off" anything
- Focus on pleasure, comfort, and emotional regulation
- Respect energy levels that may fluctuate with medication
- Avoid activities that could trigger diet mentality or body shame`;
      
      const emotionalState = checkInData.feelings.join(', ');
      const intensity = checkInData.emotionalIntensity;
      const hungerLevel = checkInData.hungerFullnessLevel;
      
      userPrompt = `Someone is feeling ${emotionalState} (intensity ${intensity}/10) this evening. Their hunger/fullness level is ${hungerLevel}/10.

Suggest 3 specific, actionable activities they could do right now. Each should be:
- 5-20 minutes long
- Accessible at home
- Directly addressing their emotional needs
- Not food-related
- Gentle and self-compassionate

For each activity, provide:
- Title (short and appealing)
- Brief description (1-2 sentences)
- Why it helps their specific emotional state
- Estimated duration

Return ONLY a valid JSON array (no other text) with exactly 3 objects in this format:
[{"title": "Activity Name", "description": "Brief description", "why": "Why it helps", "duration": "10-15 minutes"}]`;
    }

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        model: 'grok-2-1212',
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Grok API request failed: ${response.status} - ${errorText}`);
      throw new Error(`Grok API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Log the response for debugging
    console.log('Grok response for type', type, ':', aiResponse);

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error getting AI insights:', error);
    errorLogger.aiService(error, null, {
      type: type || 'unknown',
      hasApiKey: !!GROK_API_KEY,
      operation: 'generate_insights'
    });
    // Return graceful fallback instead of 500 error
    return NextResponse.json({ 
      response: 'AI insights are temporarily unavailable. Your check-in has been saved successfully!' 
    });
  }
}