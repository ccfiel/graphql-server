import { writable } from 'svelte/store';
export const user = writable({
	id: '',
	email: '',
	sessionId: '',
	emailVerified: false,
});
