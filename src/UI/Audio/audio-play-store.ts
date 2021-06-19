import { writable } from 'svelte/store';

const audioPlayStore = writable<boolean>(false);

export default audioPlayStore;
