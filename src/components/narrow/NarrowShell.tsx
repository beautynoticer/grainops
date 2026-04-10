import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { recordSubmitFlow } from "../../lib/narrowEventFlow";
import { resolveNarrowSurfaceStateFromRuntime, type NarrowSurfaceState } from "../../lib/narrowUiState";
import { ResultCard } from "./ResultCard";
import { DevInspectionPanel } from "./DevInspectionPanel";

const shouldRenderDevInspection = (isDev: boolean, search: string) => {
  if (!isDev) return false;
  const params = new URLSearchParams(search);
  return params.get("dev_inspect") === "1";
};

export function NarrowShell() {
  const [input, setInput] = useState("");
  const [submissionCount, setSubmissionCount] = useState(0);
  const [screenState, setScreenState] = useState<NarrowSurfaceState>({ kind: "empty", showCard: false });
  const [shellError, setShellError] = useState<string | null>(null);
  const clarificationRef = useRef<HTMLHeadingElement>(null);
  const narrowingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (screenState.kind === "wrapper_clarification") {
      clarificationRef.current?.focus();
    }
    if (screenState.kind === "unsupported_narrowing") {
      narrowingRef.current?.focus();
    }
  }, [screenState.kind]);

  const helper = useMemo(() => {
    if (screenState.kind === "empty") return "Enter one term or phrase.";
    if (screenState.kind === "loading") return "Checking narrow runtime…";
    if (screenState.kind === "wrapper_clarification") return "Clarification required before rendering a card.";
    if (screenState.kind === "unsupported_narrowing") return "Input too broad. Narrow to one explicit target term.";
    return "Result ready.";
  }, [screenState]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShellError(null);
    setScreenState({ kind: "loading", showCard: false });

    window.setTimeout(() => {
      try {
        const runtime = recordSubmitFlow({
          input,
          submissionCount,
          previousState: screenState.kind,
        });
        setScreenState(resolveNarrowSurfaceStateFromRuntime(input, runtime));
        setSubmissionCount((count) => count + 1);
      } catch (error) {
        setShellError(error instanceof Error ? error.message : "Runtime failure");
        setScreenState({ kind: "empty", showCard: false });
      }
    }, 320);
  };

  const showDevInspection = shouldRenderDevInspection(
    import.meta.env.DEV,
    typeof window === "undefined" ? "" : window.location.search,
  );

  return (
    <main className="narrow-shell">
      <header className="narrow-topbar">narrow prove-it</header>
      <section className="narrow-stage">
        <form className="narrow-input-wrap" onSubmit={onSubmit}>
          <label htmlFor="narrow-input" className="narrow-label">
            One input
          </label>
          <div className="narrow-input-row">
            <input
              id="narrow-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="e.g. what does due process mean"
            />
            <button type="submit">Run</button>
          </div>
          <p className="narrow-helper">{helper}</p>
        </form>

        {shellError && <div className="narrow-status narrow-status-error">{shellError}</div>}

        {screenState.kind === "empty" && !shellError && (
          <section className="narrow-status-card">
            <h2>Single target input</h2>
            <p>Use one explicit term or phrase to run the narrow card path.</p>
          </section>
        )}

        {screenState.kind === "loading" && <div className="narrow-status">Loading…</div>}

        {screenState.kind === "result" && <ResultCard card={screenState.card} saveContext={screenState.save_context} />}

        {screenState.kind === "wrapper_clarification" && (
          <section className="narrow-status-card">
            <h2 ref={clarificationRef} tabIndex={-1}>Target isolation required</h2>
            <p>Name the exact target term first. Then one card will render.</p>
          </section>
        )}

        {screenState.kind === "unsupported_narrowing" && (
          <section className="narrow-status-card">
            <h2 ref={narrowingRef} tabIndex={-1}>Narrowing required</h2>
            <p>This input is too broad. Isolate one explicit target term or phrase.</p>
          </section>
        )}

        {showDevInspection && <DevInspectionPanel />}
      </section>
    </main>
  );
}
