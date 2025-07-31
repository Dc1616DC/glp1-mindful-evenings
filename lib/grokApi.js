// Client-side functions that call our API routes
export async function getAIInsights(checkInData, userHistory = []) {
  try {
    const response = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkInData,
        userHistory,
        type: 'insights'
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error getting AI insights:', error);
    return null;
  }
}

export async function getPersonalizedActivitySuggestions(checkInData) {
  try {
    const response = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkInData,
        userHistory: [],
        type: 'activity-suggestions'
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    // Parse the JSON response from Grok
    try {
      // Sometimes Grok returns JSON directly, sometimes as a string
      if (typeof data.response === 'string') {
        let jsonString = data.response;
        
        // Try to fix common JSON issues
        // Fix incomplete JSON by looking for missing closing brackets
        if (jsonString.includes('"why":') && !jsonString.trim().endsWith(']')) {
          // Count opening and closing brackets
          const openBrackets = (jsonString.match(/\[/g) || []).length;
          const closeBrackets = (jsonString.match(/\]/g) || []).length;
          const openBraces = (jsonString.match(/\{/g) || []).length;
          const closeBraces = (jsonString.match(/\}/g) || []).length;
          
          // Add missing brackets/braces
          if (openBraces > closeBraces) {
            jsonString += '"}';  // Close the duration field
          }
          if (openBrackets > closeBrackets) {
            jsonString += ']';
          }
        }
        
        // Try to extract JSON array from the response
        const jsonMatch = jsonString.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(jsonString);
      }
      return data.response;
    } catch (parseError) {
      // Only log in development, not in production
      if (process.env.NODE_ENV === 'development') {
        console.log('Initial JSON parse failed, trying fallback methods...');
      }
      
      // Try a more aggressive parsing approach
      try {
        // Extract activities manually using regex
        const activities = [];
        const activityMatches = data.response.matchAll(/\{\s*"title":\s*"([^"]+)"[\s\S]*?"description":\s*"([^"]+)"[\s\S]*?"why":\s*"([^"]+)"[\s\S]*?"duration":\s*"([^"]+)"/g);
        
        for (const match of activityMatches) {
          activities.push({
            title: match[1],
            description: match[2],
            why: match[3],
            duration: match[4]
          });
        }
        
        if (activities.length > 0) {
          return activities;
        }
      } catch (e) {
        // Silently fail and use fallback suggestions
      }
      
      // Return fallback suggestions
      return [
        {
          title: "Gentle Breathing",
          description: "Take slow, deep breaths to calm your nervous system",
          why: "Helps reduce stress and anxiety",
          duration: "5-10 minutes"
        },
        {
          title: "Progressive Relaxation",
          description: "Tense and release each muscle group to release physical tension",
          why: "Addresses both physical and emotional stress",
          duration: "10-15 minutes"
        },
        {
          title: "Mindful Movement",
          description: "Gentle stretches or slow walking to reconnect with your body",
          why: "Helps process emotions through physical movement",
          duration: "5-10 minutes"
        }
      ];
    }
  } catch (error) {
    console.error('Error getting AI activity suggestions:', error);
    return null;
  }
}

export async function analyzePatterns(userCheckIns) {
  if (!userCheckIns || userCheckIns.length < 3) {
    return null;
  }

  try {
    const response = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkInData: null,
        userHistory: userCheckIns,
        type: 'patterns'
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Error analyzing patterns:', error);
    return null;
  }
}