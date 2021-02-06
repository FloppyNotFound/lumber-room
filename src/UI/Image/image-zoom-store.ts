import { writable } from "svelte/store";

const imageZoomStore = writable<boolean>(false);

export default imageZoomStore;
