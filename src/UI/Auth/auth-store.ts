import { writable } from 'svelte/store';

const authStore = writable<string | undefined>(void 0);

export default authStore;
