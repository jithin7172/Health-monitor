import { json } from '@sveltejs/kit';
import { HUGGINGFACE_API_KEY } from '$env/static/private';

const API_URL = "https://api-inference.huggingface.co/models/microsoft/biogpt";

export async function POST({ request }) {
  try {
    const { type, userMetrics, userInput, username } = await request.json();

    if (!userMetrics || !userMetrics.weight || !userMetrics.height || !userMetrics.bmi) {
      return json({ error: 'Invalid metrics data received' }, { status: 400 });
    }

    if (type === 'chat') {
      try {
        // Create health context
        const healthContext = `
User Health Profile:
- BMI: ${userMetrics.bmi.toFixed(1)} (${getBMICategory(userMetrics.bmi)})
- Weight: ${userMetrics.weight} kg
- Height: ${userMetrics.height} cm
- Daily Calories (BMR): ${Math.round(userMetrics.bmr)}
- Target Calories: ${Math.round(userMetrics.bmr * 1.2)}

Question: ${userInput}

Please provide health advice based on these metrics.`;

        // Call Hugging Face API
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: healthContext,
            parameters: {
              max_length: 500,
              temperature: 0.7,
              top_p: 0.9,
              do_sample: true
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const aiResponse = await response.json();
        
        // Format AI response
        let formattedResponse = aiResponse[0]?.generated_text || '';
        
        // If AI fails to generate a response, fall back to rule-based
        if (!formattedResponse.trim()) {
          return json({ response: generateHealthResponse(userMetrics, userInput, username) });
        }

        // Add personalization
        formattedResponse = `Hi ${username}, ${formattedResponse}`;

        return json({ response: formattedResponse });
      } catch (aiError) {
        console.error('AI Error:', aiError);
        // Fall back to rule-based responses if AI fails
        return json({ 
          response: generateHealthResponse(userMetrics, userInput, username) 
        });
      }
    } else {
      const mockPlan = generateMockPlan(userMetrics);
      return json(mockPlan);
    }
  } catch (error) {
    console.error('Error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}

function generateHealthResponse(metrics, userInput, username) {
  const input = userInput.toLowerCase();
  const calories = Math.round(metrics.bmr * 1.2);
  const protein = Math.round(metrics.weight * 1.8);
  const water = (metrics.weight * 0.033).toFixed(1);

  if (input.includes('hi') || input.includes('hello')) {
    return `Hello ${username}! 👋 I can help you with personalized diet and exercise recommendations based on your metrics. What would you like to know?`;
  }

  if (input.includes('yeah') || input.includes('yes') || input.includes('love to know')) {
    return `Here's a detailed meal plan to reach your ${calories} calorie goal:

Breakfast (${Math.round(calories * 0.3)} calories):
- Option 1: Oatmeal (150cal) + banana (105cal) + 2 eggs (140cal) + coffee
- Option 2: Greek yogurt (120cal) + granola (140cal) + berries (85cal) + almonds (50cal)

Lunch (${Math.round(calories * 0.35)} calories):
- Option 1: Grilled chicken breast (165cal) + brown rice (150cal) + mixed vegetables (100cal)
- Option 2: Tuna sandwich (320cal) + apple (95cal) + mixed salad (70cal)

Dinner (${Math.round(calories * 0.25)} calories):
- Option 1: Baked salmon (233cal) + quinoa (120cal) + roasted vegetables (100cal)
- Option 2: Lean beef stir-fry (250cal) + brown rice (150cal)

Snacks (${Math.round(calories * 0.1)} calories):
- Morning: 1 apple (95cal) + 12 almonds (80cal)
- Afternoon: Greek yogurt (120cal) OR protein bar (180cal)

Key Tips:
1. Track portions using a food scale or measuring cups
2. Prep meals in advance
3. Drink ${water}L water throughout the day
4. Aim for ${protein}g protein daily
5. Eat every 3-4 hours

Would you like specific recipes for any of these meals?`;
  }

  if (input.includes('how') && (input.includes('achieve') || input.includes('mage'))) {
    return `To achieve your daily target of ${calories} calories, here's a structured plan:

1. Meal Timing:
   - Breakfast (7-9 AM): ${Math.round(calories * 0.3)} calories
   - Lunch (12-2 PM): ${Math.round(calories * 0.35)} calories
   - Dinner (6-8 PM): ${Math.round(calories * 0.25)} calories
   - Snacks: ${Math.round(calories * 0.1)} calories

2. Daily Targets:
   - Protein: ${protein}g (${Math.round(protein/4)}g per meal)
   - Water: ${water}L (about ${Math.round(water*4)} glasses)
   - Vegetables: 3-4 servings
   - Whole grains: 2-3 servings

3. Practical Tips:
   - Use a calorie tracking app
   - Measure portions
   - Prep meals in advance
   - Keep healthy snacks ready

Would you like to see specific meal suggestions with calorie counts?`;
  }

  if (input.includes('diet') || input.includes('eat')) {
    return `Based on your metrics (BMI: ${metrics.bmi.toFixed(1)}, Weight: ${metrics.weight}kg), here are your daily targets:

1. Calories: ${calories} calories
2. Protein: ${protein}g
3. Water: ${water}L

Would you like to know how to achieve these targets with specific meal suggestions?`;
  }

  return `I can help you with:
- Diet recommendations
- Exercise plans
- Calorie calculations
- Meal planning
What would you like to know about?`;
}

// Keep existing helper functions (generateMockPlan, getBMICategory)...