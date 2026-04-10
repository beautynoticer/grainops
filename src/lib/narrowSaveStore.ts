import { assertCanonicalSaveReason, type CanonicalSaveReason, type CardState, type RouteType, type SeedClass } from "./narrowRuntime.ts";

type Listener = () => void;

export type NarrowSaveRecord = {
  governing_term: string;
  selected_canonical_save_reason: CanonicalSaveReason;
  timestamp: number;
  route: RouteType;
  seed_class: SeedClass;
  card_state: CardState;
};

const saved: NarrowSaveRecord[] = [];
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

export const persistNarrowSave = (record: Omit<NarrowSaveRecord, "selected_canonical_save_reason"> & { selected_canonical_save_reason: string }) => {
  assertCanonicalSaveReason(record.selected_canonical_save_reason);
  if (!record.governing_term) {
    throw new Error("Cannot persist save without governing_term");
  }

  const persisted: NarrowSaveRecord = {
    governing_term: record.governing_term,
    selected_canonical_save_reason: record.selected_canonical_save_reason,
    timestamp: record.timestamp,
    route: record.route,
    seed_class: record.seed_class,
    card_state: record.card_state,
  };

  saved.push(persisted);
  notify();

  return persisted;
};

export const getNarrowSaves = (): NarrowSaveRecord[] => [...saved];

export const clearNarrowSaves = () => {
  saved.length = 0;
  notify();
};

export const subscribeNarrowSaves = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
