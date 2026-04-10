import { CANONICAL_SAVE_REASONS, assertCanonicalSaveReason, runFrozenNarrowRuntime, type CanonicalSaveReason, type CardState, type RouteType, type SeedClass } from "./narrowRuntime.ts";
import { UI_CARD_FIXTURES, type NarrowCardFixture } from "./narrowUiFixtures.ts";

export type NarrowSurfaceState =
  | { kind: "empty"; showCard: false }
  | { kind: "loading"; showCard: false }
  | {
      kind: "result";
      showCard: true;
      card: NarrowCardFixture;
      save_context: {
        governing_term: string;
        route: RouteType;
        seed_class: SeedClass;
        card_state: CardState;
      };
    }
  | { kind: "wrapper_clarification"; showCard: false }
  | { kind: "unsupported_narrowing"; showCard: false };

export type SaveUiState = {
  menuOpen: boolean;
  selectedReason: CanonicalSaveReason | null;
  completed: boolean;
};

export const SAVE_REASON_OPTIONS: CanonicalSaveReason[] = [...CANONICAL_SAVE_REASONS];

export const initialSaveUiState = (): SaveUiState => ({
  menuOpen: false,
  selectedReason: null,
  completed: false,
});

export const completeSaveSelection = (reason: string): SaveUiState => {
  assertCanonicalSaveReason(reason);

  return {
    menuOpen: false,
    selectedReason: reason,
    completed: true,
  };
};

const toRuntimeApprovedCard = (governingTerm: string): NarrowCardFixture => {
  if (governingTerm.includes("carrier")) {
    return { ...UI_CARD_FIXTURES.carrier_inset, governing_term: governingTerm };
  }

  return { ...UI_CARD_FIXTURES.three_lane, governing_term: governingTerm };
};

export const resolveNarrowSurfaceStateFromRuntime = (
  input: string,
  runtime: ReturnType<typeof runFrozenNarrowRuntime>,
): NarrowSurfaceState => {
  if (!input.trim()) return { kind: "empty", showCard: false };
  if (runtime.unsupported_narrowing_required) return { kind: "unsupported_narrowing", showCard: false };
  if (runtime.clarification_required) return { kind: "wrapper_clarification", showCard: false };

  if (runtime.card_state === "B" && runtime.governing_term) {
    return {
      kind: "result",
      showCard: true,
      card: toRuntimeApprovedCard(runtime.governing_term),
      save_context: {
        governing_term: runtime.governing_term,
        route: runtime.route,
        seed_class: runtime.seed_class,
        card_state: runtime.card_state,
      },
    };
  }

  return { kind: "wrapper_clarification", showCard: false };
};

export const resolveNarrowSurfaceState = (input: string): NarrowSurfaceState => {
  const runtime = runFrozenNarrowRuntime(input);
  return resolveNarrowSurfaceStateFromRuntime(input, runtime);
};
