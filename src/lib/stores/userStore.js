import { writable } from 'svelte/store';

export const userMetrics = writable({
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: '',
    goal: '',
    dietaryRestrictions: ''
}); 