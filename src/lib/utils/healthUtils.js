export function isHealthQuery(message) {
  const healthKeywords = [
    'diet', 'exercise', 'workout', 'meal', 'food',
    'nutrition', 'fitness', 'weight', 'health',
    'calories', 'protein', 'carbs', 'fat'
  ];
  
  return healthKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

export function formatHealthResponse(response) {
  // Clean up and format the AI response
  return response
    .trim()
    .replace(/\n\n+/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n');
} 