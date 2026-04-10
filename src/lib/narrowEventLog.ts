import { assertCanonicalEvent, type CanonicalRuntimeEvent } from "./narrowRuntime.ts";

type Listener = () => void;

type EventEntry = {
  name: CanonicalRuntimeEvent;
  at: number;
};

const entries: EventEntry[] = [];
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const emitCanonicalEvent = (name: string): CanonicalRuntimeEvent => {
  assertCanonicalEvent(name);
  entries.push({ name, at: Date.now() });
  notify();
  return name;
};

export const getCanonicalEventLog = (): EventEntry[] => [...entries];

export const clearCanonicalEventLog = () => {
  entries.length = 0;
  notify();
};

export const subscribeCanonicalEventLog = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
