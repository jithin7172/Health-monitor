<script>
  import { HfInference } from '@huggingface/inference';
  
  // Initialize the Hugging Face client with your token
  const client = new HfInference(import.meta.env.VITE_HUGGINGFACE_TOKEN);
  
  let loading = false;
  let error = null;
  let dietPlan = '';
  let exercisePlan = '';
  let userMetrics = {
    age: '',
    weight: '',
    height: '',
    gender: '',
    goal: '',
    dietaryRestrictions: '',
    activityLevel: ''
  };

  async function generateDietPlan() {
    loading = true;
    error = null;
    try {
      const prompt = `As a professional nutritionist, create a detailed daily diet plan for a person with the following characteristics:
      Age: ${userMetrics.age}
      Weight: ${userMetrics.weight} kg
      Height: ${userMetrics.height} cm
      Gender: ${userMetrics.gender}
      Goal: ${userMetrics.goal}
      Dietary Restrictions: ${userMetrics.dietaryRestrictions}
      Activity Level: ${userMetrics.activityLevel}

      Please provide:
      1. Total daily calorie target
      2. Macronutrient breakdown
      3. Detailed meal plan including:
         - Breakfast
         - Morning Snack
         - Lunch
         - Afternoon Snack
         - Dinner
      Include portion sizes and approximate calories per meal.`;

      const response = await client.textGeneration({
        model: "microsoft/phi-2",
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.15
        }
      });

      dietPlan = response.generated_text;
    } catch (e) {
      error = "Failed to generate diet plan. Please try again.";
      console.error('Error:', e);
    } finally {
      loading = false;
    }
  }

  async function generateExercisePlan() {
    loading = true;
    error = null;
    try {
      const prompt = `As a professional fitness trainer, create a detailed weekly exercise plan for a person with the following characteristics:
      Age: ${userMetrics.age}
      Weight: ${userMetrics.weight} kg
      Height: ${userMetrics.height} cm
      Gender: ${userMetrics.gender}
      Goal: ${userMetrics.goal}
      Activity Level: ${userMetrics.activityLevel}

      Please provide:
      1. Weekly workout schedule
      2. For each day, include:
         - Specific exercises
         - Number of sets
         - Number of reps
         - Rest periods
         - Estimated duration
      3. Include warm-up and cool-down routines
      4. Add safety tips and form guidance`;

      const response = await client.textGeneration({
        model: "microsoft/phi-2",
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.15
        }
      });

      exercisePlan = response.generated_text;
    } catch (e) {
      error = "Failed to generate exercise plan. Please try again.";
      console.error('Error:', e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  <h1>Personalized Health Plan Generator</h1>
  
  <div class="form-container">
    <h2>Your Information</h2>
    <form>
      <div class="form-group">
        <label for="age">Age</label>
        <input id="age" type="number" bind:value={userMetrics.age} required />
      </div>

      <div class="form-group">
        <label for="weight">Weight (kg)</label>
        <input id="weight" type="number" bind:value={userMetrics.weight} required />
      </div>

      <div class="form-group">
        <label for="height">Height (cm)</label>
        <input id="height" type="number" bind:value={userMetrics.height} required />
      </div>

      <div class="form-group">
        <label for="gender">Gender</label>
        <select id="gender" bind:value={userMetrics.gender} required>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="form-group">
        <label for="goal">Goal</label>
        <select id="goal" bind:value={userMetrics.goal} required>
          <option value="">Select Goal</option>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div class="form-group">
        <label for="restrictions">Dietary Restrictions</label>
        <input id="restrictions" type="text" bind:value={userMetrics.dietaryRestrictions} />
      </div>

      <div class="form-group">
        <label for="activity">Activity Level</label>
        <select id="activity" bind:value={userMetrics.activityLevel} required>
          <option value="">Select Activity Level</option>
          <option value="sedentary">Sedentary</option>
          <option value="light">Lightly Active</option>
          <option value="moderate">Moderately Active</option>
          <option value="very">Very Active</option>
        </select>
      </div>

      <div class="button-group">
        <button type="button" on:click={generateDietPlan} disabled={loading}>
          Generate Diet Plan
        </button>
        <button type="button" on:click={generateExercisePlan} disabled={loading}>
          Generate Exercise Plan
        </button>
      </div>
    </form>
  </div>

  {#if loading}
    <div class="loading">Generating your plan... Please wait...</div>
  {/if}

  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if dietPlan}
    <div class="plan-container">
      <h2>Your Diet Plan</h2>
      <pre>{dietPlan}</pre>
    </div>
  {/if}

  {#if exercisePlan}
    <div class="plan-container">
      <h2>Your Exercise Plan</h2>
      <pre>{exercisePlan}</pre>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .form-container {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }

  input, select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }

  button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .loading {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .error {
    color: red;
    padding: 10px;
    margin: 10px 0;
    background-color: #ffebee;
    border-radius: 4px;
  }

  .plan-container {
    margin-top: 20px;
    padding: 20px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  pre {
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    line-height: 1.5;
  }
</style> 