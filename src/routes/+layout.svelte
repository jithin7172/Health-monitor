<script>
  import "../app.css";
  import { onMount } from "svelte";
  import { initFirebase } from "$lib/client/firebase";
  import { onAuthStateChanged } from 'firebase/auth';
  import { auth as authStore } from "../stores/auth";
/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch, data }) {
  const { auth } = initFirebase();
  
  return {
    ...data
  };
}
</script>

<slot />
