// stores/auth.js
import { derived } from 'svelte/store';
import { page } from '$app/stores';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { writable } from 'svelte/store';
import { initFirebase } from "$lib/client/firebase";

const authStore = writable(null);

// Create auth store with additional methods
const createAuthStore = () => {
  const { subscribe } = derived(
    [authStore, page],
    ([$authStore, $page]) => {
      if ($authStore) {
        return $authStore;
      }
      const { user } = $page.data || {};
      return user || null;
    },
    null
  );

  return {
    subscribe,
    signOut: async () => {
      const { auth: firebaseAuth } = initFirebase();
      await signOut(firebaseAuth);
      authStore.set(null);
    }
  };
};

export const auth = createAuthStore();

// Initialize auth listener
if (typeof window !== 'undefined') {
  const { auth: firebaseAuth } = initFirebase();
  onAuthStateChanged(firebaseAuth, (user) => {
    authStore.set(user);
  });
}