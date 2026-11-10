import { useStore } from 'zustand';
import { createMessageStore, type MessageState } from './messageStore';

export const messageStore = createMessageStore();

export function useMessages<T>(selector: (state: MessageState) => T): T {
  return useStore(messageStore, selector);
}
