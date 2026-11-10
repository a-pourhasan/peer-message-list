import { describe, expect, it } from 'vitest';
import type { Message } from '../core/messageIndex';
import { createMessageStore } from './messageStore';

const msg = (id: string, ts: number, peer = 'amir'): Message => ({
  id,
  peer,
  ts,
  text: `hello ${id}`,
});

describe('message store', () => {
  it('batches many pushes into a single state update', () => {
    const tasks: Array<() => void> = [];
    const store = createMessageStore((task) => tasks.push(task));
    let updates = 0;
    store.subscribe(() => updates++);

    for (let i = 0; i < 100; i++) store.getState().push(msg(`m${i}`, i));

    expect(tasks).toHaveLength(1);
    expect(updates).toBe(0);

    tasks[0]();

    expect(updates).toBe(1);
    expect(store.getState().items).toHaveLength(100);
  });

  it('ensures items reference changes after each flush (immutability)', () => {
    const tasks: Array<() => void> = [];
    const store = createMessageStore((task) => tasks.push(task));

    store.getState().push(msg('m1', 10));
    tasks.shift()?.();
    const firstRef = store.getState().items;

    store.getState().push(msg('m2', 20));
    tasks.shift()?.();
    const secondRef = store.getState().items;

    expect(secondRef).not.toBe(firstRef);
    expect(secondRef).toHaveLength(2);
  });

  it('handles out-of-order and duplicate messages properly', () => {
    const store = createMessageStore((task) => task());

    store.getState().push(msg('m2', 200));
    store.getState().push(msg('m0', 100));
    store.getState().push(msg('m1', 150));
    store.getState().push(msg('m0', 100));

    const state = store.getState();
    expect(state.items.map((m) => m.id)).toEqual(['m0', 'm1', 'm2']);
    expect(state.stats).toEqual({ received: 4, unique: 3 });
  });

  it('clears items, queue, and stats', () => {
    const store = createMessageStore((task) => task());

    store.getState().push(msg('m1', 100));
    store.getState().push(msg('m2', 200));
    expect(store.getState().items).toHaveLength(2);

    store.getState().clear();
    const state = store.getState();
    expect(state.items).toHaveLength(0);
    expect(state.stats).toEqual({ received: 0, unique: 0 });

    store.getState().push(msg('m1', 100));
    expect(store.getState().items).toHaveLength(1);
  });
});
