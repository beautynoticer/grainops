import { emitCanonicalEvent } from "./narrowEventLog.ts";
import { runFrozenNarrowRuntime , type CanonicalSaveReason, type FrozenRuntimeOutcome } from "./narrowRuntime.ts";

export type SubmitFlowContext = {
  input: string;
  submissionCount: number;
  previousState: "empty" | "loading" | "result" | "wrapper_clarification" | "unsupported_narrowing";
};

export const recordSubmitFlow = ({ input, submissionCount, previousState }: SubmitFlowContext): FrozenRuntimeOutcome => {
  if (submissionCount > 0) {
    emitCanonicalEvent("followup_lookup_submitted");
  } else {
    emitCanonicalEvent("lookup_submitted");
  }

  if (previousState === "wrapper_clarification") {
    emitCanonicalEvent("route_clarification_answered");
  }

  const runtime = runFrozenNarrowRuntime(input);

  if (runtime.clarification_required) {
    emitCanonicalEvent("route_clarification_shown");
  } else if (runtime.card_state === "B") {
    emitCanonicalEvent("card_rendered");
  }

  return runtime;
};

export const recordLaneOpenEvents = (hasLineage: boolean, hasCarrier: boolean) => {
  emitCanonicalEvent("lane_opened_meaning");
  emitCanonicalEvent("lane_opened_use");
  if (hasLineage) emitCanonicalEvent("lane_opened_lineage");
  if (hasCarrier) emitCanonicalEvent("carrier_note_opened");
};

export const recordCopyEvent = (lane: "meaning" | "use" | "lineage") => {
  if (lane === "meaning") emitCanonicalEvent("copy_from_meaning");
  if (lane === "use") emitCanonicalEvent("copy_from_use");
  if (lane === "lineage") emitCanonicalEvent("copy_from_lineage");
};

export const recordSaveClicked = () => emitCanonicalEvent("save_clicked");

export const recordSaveReasonSelected = (_reason: CanonicalSaveReason) => emitCanonicalEvent("save_reason_selected");
