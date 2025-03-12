<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { HfInference } from "@huggingface/inference";
  import { auth } from "../../stores/auth";
  import { userMetrics } from '$lib/stores/userStore';
  
  // Add console.log to debug token
  const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;
  console.log('Hugging Face Token:', HF_TOKEN ? 'Present' : 'Missing');
  
  let messages = [];
  let userInput = '';
  let isThinking = false;
  let client;

  try {
    client = new HfInference(HF_TOKEN);
  } catch (error) {
    console.error('Error initializing Hugging Face client:', error);
  }

  // Predefined suggestion buttons
  const suggestions = [
    "Create a personalized diet plan",
    "Design a workout routine",
    "Calculate my daily calorie needs",
    "Suggest healthy meal ideas",
    "Plan a week of meals"
  ];

  onMount(() => {
    // Check if coming from diet page
    if ($page?.state?.source === 'diet') {
      // Automatically trigger diet plan generation
      handleMessage("Generate a personalized diet and exercise plan based on my metrics");
    } else {
      messages = [
        {
          type: 'assistant',
          content: "Hello! I'm your AI health assistant. I can help you create personalized diet and exercise plans. What would you like to know?"
        }
      ];
    }
  });

  function handleBackToDiet() {
    goto('/diet');
  }

  async function handleMessage(message) {
    try {
      if (!client) {
        throw new Error('Hugging Face client not initialized');
      }

      messages = [...messages, { type: 'user', content: message }];
      isThinking = true;
      userInput = '';

      const response = await client.textGeneration({
        model: "microsoft/phi-2", // Changed to a more reliable model
        inputs: `You are a helpful AI health assistant. User asks: ${message}. 
                Provide a clear and concise response about health, diet, or exercise.`,
        parameters: {
          max_new_tokens: 512,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.2
        }
      });

      messages = [...messages, { 
        type: 'assistant', 
        content: response.generated_text.trim() 
      }];
    } catch (error) {
      console.error('Chat error:', error);
      messages = [...messages, {
        type: 'assistant',
        content: "I apologize, but I encountered an error. Please check your Hugging Face API token and try again."
      }];
    } finally {
      isThinking = false;
    }
  }

  function handleSuggestionClick(suggestion) {
    handleMessage(suggestion);
  }

  function isDietOrExerciseQuery(message) {
    const healthKeywords = [
      'diet', 'exercise', 'workout', 'meal', 'food',
      'nutrition', 'fitness', 'weight', 'health',
      'calories', 'protein', 'carbs', 'fat', 'plan'
    ];
    
    return healthKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  function handleDietPlanClick() {
    goto('/dietplan');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey && userInput.trim()) {
      event.preventDefault();
      handleMessage(userInput);
    }
  }
</script>

<div class="chat-container dark:bg-gray-800">
  <div class="chat-header">
    <button 
      class="back-button"
      on:click={handleBackToDiet}
    >
      ← Back to Diet Page
    </button>
    <h2 class="text-xl font-bold dark:text-white">AI Health Assistant</h2>
    <button 
      class="diet-plan-button"
      on:click={handleDietPlanClick}
    >
      Open Full Diet Planner
    </button>
  </div>

  <div class="suggested-prompts">
    {#each suggestions as suggestion}
      <button 
        class="prompt-button dark:bg-gray-700 dark:text-white"
        on:click={() => handleSuggestionClick(suggestion)}
      >
        {suggestion}
      </button>
    {/each}
  </div>

  <div class="messages-container">
    {#each messages as message}
      <div class="message {message.type} {message.isDietPlan ? 'diet-plan' : ''}">
        {#if message.isDietPlan}
          <div class="diet-plan-content">
            <h3 class="text-lg font-semibold mb-2">Personalized Health Plan</h3>
            {#each message.content.split('\n') as line}
              {#if line.trim()}
                <p class="mb-2">{line}</p>
              {/if}
            {/each}
          </div>
        {:else}
          <p>{message.content}</p>
        {/if}
      </div>
    {/each}
    
    {#if isThinking}
      <div class="thinking">
        <div class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    {/if}
  </div>

  <div class="input-container">
    <textarea
      class="input-field dark:bg-gray-700 dark:text-white"
      bind:value={userInput}
      placeholder="Ask about diet plans, workouts, or nutrition advice..."
      on:keydown={handleKeyDown}
      rows="1"
    ></textarea>
    <button 
      class="send-button"
      disabled={!userInput.trim() || isThinking}
      on:click={() => handleMessage(userInput)}
    >
      Send
    </button>
  </div>
</div>

<style>
  .chat-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: white;
  }

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px;
    border-bottom: 1px solid #eee;
  }

  .diet-plan-button {
    background-color: #4867AA;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .diet-plan-button:hover {
    background-color: #3b5998;
  }

  .back-button {
    padding: 8px 16px;
    background-color: var(--card-bg-color);
    color: var(--card-text-color);
    border-radius: 20px;
    font-size: 0.9em;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .back-button:hover {
    background-color: var(--highlight-bg-color);
    color: white;
  }

  .suggested-prompts {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }

  .prompt-button {
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 15px;
    padding: 8px 15px;
    font-size: 0.9em;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .prompt-button:hover {
    background-color: #e0e0e0;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .message {
    padding: 12px 16px;
    border-radius: 12px;
    max-width: 85%;
    animation: fadeIn 0.3s ease-out;
  }

  .message.user {
    background-color: #4867AA;
    color: white;
    align-self: flex-end;
  }

  .message.assistant {
    background-color: #f0f0f0;
    color: black;
    align-self: flex-start;
  }

  .message.diet-plan {
    background-color: white;
    border: 1px solid #4867AA;
  }

  .diet-plan-content {
    padding: 10px;
  }

  .input-container {
    display: flex;
    gap: 10px;
    padding: 20px 0;
    border-top: 1px solid #eee;
  }

  .input-field {
    flex: 1;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    font-size: 1em;
    resize: none;
    min-height: 44px;
    max-height: 150px;
    line-height: 1.4;
  }

  .send-button {
    padding: 10px 24px;
    border: none;
    border-radius: 20px;
    background-color: #4867AA;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .send-button:hover:not(:disabled) {
    background-color: #3b5998;
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .thinking {
    align-self: center;
    padding: 10px;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
  }

  .typing-indicator span {
    width: 8px;
    height: 8px;
    background-color: #4867AA;
    border-radius: 50%;
    animation: bounce 1s infinite;
  }

  .typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }
</style> 