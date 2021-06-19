import { writable } from 'svelte/store';

const audioRestartStore = writable<boolean>(false);

export default audioRestartStore;
