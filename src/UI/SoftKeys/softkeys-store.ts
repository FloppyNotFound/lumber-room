import { Subscriber, Unsubscriber, writable } from 'svelte/store';
import type { Softkeys } from './models/softkeys.model';
import type { Softkey } from './models/softkey.model';

interface SoftkeysStore {
  subscribe: (this: void, run: Subscriber<Softkeys>) => Unsubscriber;
  clear: () => void;
  set: (softkeys: Softkeys) => void;
  setLeft: (softkey?: Softkey) => void;
  setCenter: (softkey?: Softkey) => void;
  setRight: (softkey?: Softkey) => void;
  stack: () => void;
  pop: () => void;
}

const createSoftkeysStore = (): SoftkeysStore => {
  const { subscribe, set, update } = writable<Softkeys>({});

  const stack = <Softkeys[]>[];

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
    stack: (): void => {
      const unsubscribe = subscribe((items) => stack.push(items));
      unsubscribe();
    },
    pop: (): void => {
      const softkeys = stack.pop();
      if (!softkeys) throw Error('Stack is empty');

      set(softkeys);
    },
  };
};

const softkeysStore = createSoftkeysStore();

export default softkeysStore;
