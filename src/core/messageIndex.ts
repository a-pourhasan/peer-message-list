export interface Message {
  id: string;
  peer: string;
  ts: number;
  text: string;
}

export interface Stats {
  received: number;
  unique: number;
}

export function compareMessages(a: Message, b: Message): number {
  return a.ts - b.ts || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

export function createMessageIndex() {
  const seen = new Set<string>();
  const list: Message[] = [];
  let received = 0;

  function findIndex(msg: Message): number {
    let lo = 0;
    let hi = list.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (compareMessages(list[mid], msg) <= 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  return {
    add(msg: Message): boolean {
      received++;
      if (seen.has(msg.id)) return false;
      seen.add(msg.id);
      list.splice(findIndex(msg), 0, msg);
      return true;
    },
    clear(): void {
      seen.clear();
      list.length = 0;
      received = 0;
    },
    getAll: (): readonly Message[] => list,
    getStats: (): Stats => ({ received, unique: list.length }),
  };
}
