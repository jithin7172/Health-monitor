<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from "../../stores/auth";
  import { getFirestore, doc, getDoc } from "firebase/firestore";

  let isLoading = true;
  let username = '';
  let userData = {};
  const db = getFirestore();

  let isDark = typeof window !== 'undefined' 
    ? localStorage.getItem('theme') === 'dark' 
    || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    : false;

  // Diet plan data
  let nutritionPlan = {
    dailyTargets: {
      carbs: "196g",
      calories: "1810g",
      water: "2.97L",
      fats: "50g",
      protein: "144g"
    },
    protein: {
      target: "144g daily",
      description: "Essential for muscle maintenance and recovery",
      sources: [
        "Lean meats (chicken, turkey, fish)",
        "Eggs",
        "Greek yogurt",
        "Tofu",
        "Legumes"
      ]
    },
    exercisePlan: {
      monday: [
        "Walking/Light Jogging - 1 sets × 1 reps (30 minutes minutes)",
        "Bodyweight Squats - 3 sets × 12 reps",
        "Push-ups (or Modified Push-ups) - 3 sets × 10 reps"
      ],
      wednesday: [
        "Swimming/Cycling - 1 sets × 1 reps (25 minutes minutes)",
        "Lunges - 3 sets × 10 reps",
        "Plank Hold - 3 sets × 1 reps (30 seconds minutes)"
      ],
      friday: [
        "Brisk Walking - 1 sets × 1 reps (30 minutes minutes)",
        "Chair Dips - 3 sets × 12 reps",
        "Wall Push-ups - 3 sets × 15 reps"
      ]
    }
  };

  function toggleTheme() {
    isDark = !isDark;
    updateTheme(isDark);
  }

  function updateTheme(dark) {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut();
      goto('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  async function fetchUserMetrics(user) {
    try {
      const userDocRef = doc(db, "userdata", user.email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists() || !userDoc.data().cred) {
        goto('/creds');
      } else {
        const data = userDoc.data();
        if (data.metrics) {
          userData = data.metrics;
        } else {
          const cred = data.cred;
          const height = parseFloat(cred.height) / 100;
          const weight = parseFloat(cred.weight);
          const age = parseInt(cred.age);
          const gender = cred.gender;

          userData = {
            bmi: calculateBMI(weight, height),
            weight: weight,
            height: height * 100,
            age: age,
            gender: gender
          };
        }
      }
    } catch (error) {
      console.error("Error checking user credentials:", error);
      goto('/Creds');
    }
  }

  function calculateBMI(weight, height) {
    return (weight / (height * height)).toFixed(1);
  }

  onMount(() => {
    updateTheme(isDark);
    
    return auth.subscribe((user) => {
      if (!user) {
        goto('/login');
      } else {
        username = user.displayName || user.email?.split('@')[0] || 'User';
        fetchUserMetrics(user).then(() => {
          isLoading = false;
        });
      }
    });
  });
</script>

{#if isLoading}
<div class="loading-spinner"></div>
{:else}
<div class="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
  <div class="p-6 md:p-8 lg:p-10">
    <nav class="flex flex-wrap gap-4 mb-12 animate-fade-in">
      <button 
        on:click={() => goto('/')}
        class="px-8 py-3 rounded-full text-lg font-medium shadow-md transition-transform transform hover:scale-105" 
        style="background-color: var(--card-bg-color); color: var(--card-text-color);"
      >
        Dashboard
      </button>
      <button 
        on:click={() => goto('/diet')}
        class="px-8 py-3 rounded-full text-lg font-medium shadow-md highlight transition-transform transform hover:scale-105" 
        style="background-color: var(--highlight-bg-color); color: var(--highlight-text-color);"
      >
        Diet Plan
      </button>
      <button 
        on:click={() => goto('/chat')}
        class="px-8 py-3 rounded-full text-lg font-medium shadow-md transition-transform transform hover:scale-105" 
        style="background-color: var(--card-bg-color); color: var(--card-text-color);"
      >
        AI Assistant
      </button>
      <button 
        on:click={() => goto('/creds')}
        class="px-8 py-3 rounded-full text-lg font-medium shadow-md transition-transform transform hover:scale-105" 
        style="background-color: var(--card-bg-color); color: var(--card-text-color);"
      >
        Add New Values
      </button>
      <span class="flex items-center ml-auto mr-4 font-medium">
        Welcome, {username}
      </span>
      <button 
        on:click={handleLogout}
        class="px-8 py-3 rounded-full text-lg font-medium shadow-md transition-transform transform hover:scale-105" 
        style="background-color: var(--card-bg-color); color: var(--card-text-color);"
      >
        Logout
      </button>
      <button
        on:click={toggleTheme}
        class="px-8 py-3 rounded-full text-lg font-medium shadow-md transition-transform transform hover:scale-105"
        style="background-color: var(--card-bg-color); color: var(--card-text-color);"
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </nav>

    <header class="mb-12 animate-fade-in animation-delay-200">
      <h1 class="text-4xl font-medium mb-2">Personalized Health Plan</h1>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Nutrition Guidelines -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Nutrition Guidelines</h2>
        
        <h3 class="text-xl font-bold mb-4">Daily Targets</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-gray-600 dark:text-gray-400">Carbs</div>
            <div class="text-2xl font-bold">{nutritionPlan.dailyTargets.carbs}</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-gray-600 dark:text-gray-400">Calories</div>
            <div class="text-2xl font-bold">{nutritionPlan.dailyTargets.calories}</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-gray-600 dark:text-gray-400">Water</div>
            <div class="text-2xl font-bold">{nutritionPlan.dailyTargets.water}</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-gray-600 dark:text-gray-400">Fats</div>
            <div class="text-2xl font-bold">{nutritionPlan.dailyTargets.fats}</div>
          </div>
          <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div class="text-gray-600 dark:text-gray-400">Protein</div>
            <div class="text-2xl font-bold">{nutritionPlan.dailyTargets.protein}</div>
          </div>
        </div>

        <h3 class="text-xl font-bold mb-2">Protein</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-2">Target: {nutritionPlan.protein.target}</p>
        <p class="text-gray-600 dark:text-gray-400 mb-4">{nutritionPlan.protein.description}</p>
        <div class="mb-6">
          <h4 class="font-bold mb-2">Good sources:</h4>
          <ul class="list-disc list-inside space-y-1">
            {#each nutritionPlan.protein.sources as source}
              <li class="text-gray-600 dark:text-gray-400">{source}</li>
            {/each}
          </ul>
        </div>
      </div>

      <!-- Exercise Plan -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-bold mb-6">Exercise Plan</h2>
        
        <div class="space-y-6">
          <div>
            <h3 class="text-xl font-bold mb-4">Monday</h3>
            <ul class="list-disc list-inside space-y-2">
              {#each nutritionPlan.exercisePlan.monday as exercise}
                <li class="text-gray-600 dark:text-gray-400">{exercise}</li>
              {/each}
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-bold mb-4">Wednesday</h3>
            <ul class="list-disc list-inside space-y-2">
              {#each nutritionPlan.exercisePlan.wednesday as exercise}
                <li class="text-gray-600 dark:text-gray-400">{exercise}</li>
              {/each}
            </ul>
          </div>

          <div>
            <h3 class="text-xl font-bold mb-4">Friday</h3>
            <ul class="list-disc list-inside space-y-2">
              {#each nutritionPlan.exercisePlan.friday as exercise}
                <li class="text-gray-600 dark:text-gray-400">{exercise}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
{/if}

<style>
:global(:root) {
  --card-bg-color: #ffffff;
  --card-text-color: #1a1a1a;
  --highlight-bg-color: #4867AA;
  --highlight-text-color: #ffffff;
}

:global(.dark) {
  --card-bg-color: #374151;
  --card-text-color: #ffffff;
  --highlight-bg-color: #4867AA;
  --highlight-text-color: #ffffff;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4867AA;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.highlight {
  border: 2px solid var(--highlight-bg-color);
}

.thinking-spinner {
  font-size: 1.2em;
  color: #666;
  text-align: center;
  margin-top: 20px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style> 