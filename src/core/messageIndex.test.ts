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

  it('keeps messages are not duplicated', () => {
    const index = createMessageIndex();
    index.add(msg('m0', 100));
    index.add(msg('m0', 100));
    expect(index.getAll().map((m) => m.id)).toEqual(['m0']);
  });

  it('checks if the message list is clear', () => {
    const index = createMessageIndex();
    index.add(msg('m1', 200));
    index.add(msg('m2', 400));
    index.add(msg('m0', 100));
    index.clear();
    expect(index.getAll().length).toEqual(0);
  });
});
