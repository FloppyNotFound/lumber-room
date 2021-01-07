import { writable } from "svelte/store";
import type { Softkeys } from "./models/softkeys.model";
import type { Softkey } from "./models/softkey.model";

const createSoftkeysStore = () => {
  const { subscribe, set, update } = writable<Softkeys>({});

  return {
    subscribe,
    clear: (): void => set({}),
    set: (softkeys: Softkeys): void => set(softkeys),
    setLeft: (softkey?: Softkey): void =>
      update(
        (softkeys) =>
          <Softkeys>{
            ...softkeys,
            left: softkey,
          }
      ),
    setCenter: (softkey?: Softkey): void =>
      update(
        (softkeys) =>
          <Softkeys>{
            ...softkeys,
            center: softkey,
          }
      ),
    setRight: (softkey?: Softkey): void =>
      update(
        (softkeys) =>
          <Softkeys>{
            ...softkeys,
            right: softkey,
          }
      ),
  };
};

export const softkeysStore = createSoftkeysStore();
