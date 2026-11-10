import { createStore } from 'zustand/vanilla';
import {
  createMessageIndex,
  type Message,
  type Stats,
} from '../core/messageIndex';

export type Scheduler = (task: () => void) => void;

export interface MessageState {
  items: readonly Message[];
  stats: Stats;
  push: (msg: Message) => void;
  flush: () => void;
  clear: () => void;
}

export function createMessageStore(
  schedule: Scheduler = (task) => requestAnimationFrame(task),
) {
  const index = createMessageIndex();
  let queue: Message[] = [];
  let scheduled = false;

  return createStore<MessageState>((set, get) => ({
    items: [],
    stats: { received: 0, unique: 0 },

    push(msg) {
      queue.push(msg);
      if (scheduled) return;
      scheduled = true;
      schedule(() => {
        scheduled = false;
        get().flush();
      });
    },

    flush() {
      if (queue.length === 0) return;
      const batch = queue;
      queue = [];
      for (const msg of batch) index.add(msg);
      set({ items: index.getAll().slice(), stats: index.getStats() });
    },

    clear() {
      queue = [];
      index.clear();
      set({ items: [], stats: { received: 0, unique: 0 } });
    },
  }));
}
