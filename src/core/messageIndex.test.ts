import { describe, expect, it } from 'vitest';
import { createMessageIndex, type Message } from './messageIndex';

const msg = (id: string, ts: number, peer = 'amir'): Message => ({
  id,
  peer,
  ts,
  text: 'hello' + id,
});

describe('message index', () => {
  it('keeps messages ordered by ts even when they arrive out of order', () => {
    const index = createMessageIndex();
    index.add(msg('m2', 300));
    index.add(msg('m0', 100));
    index.add(msg('m1', 200));
    expect(index.getAll().map((m) => m.id)).toEqual(['m0', 'm1', 'm2']);
  });

  it('breaks ties by id', () => {
    const index = createMessageIndex();
    index.add(msg('b', 100));
    index.add(msg('a', 100));
    expect(index.getAll().map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('ignores duplicate ids but still counts them as received', () => {
    const index = createMessageIndex();
    expect(index.add(msg('m0', 100))).toBe(true);
    expect(index.add(msg('m0', 100))).toBe(false);
    expect(index.getAll().map((m) => m.id)).toEqual(['m0']);
    expect(index.getStats()).toEqual({ received: 2, unique: 1 });
  });

  it('clear resets the list, the stats and the seen ids', () => {
    const index = createMessageIndex();
    index.add(msg('m1', 200));
    index.add(msg('m0', 100));
    index.clear();
    expect(index.getAll()).toHaveLength(0);
    expect(index.getStats()).toEqual({ received: 0, unique: 0 });
    expect(index.add(msg('m1', 200))).toBe(true);
  });
});
