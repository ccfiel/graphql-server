import { writable } from 'svelte/store';
export const user = writable({
    id: '',
    name: '',
    sessionId: '',
  });