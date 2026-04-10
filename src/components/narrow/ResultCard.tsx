import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  recordCopyEvent,
  recordLaneOpenEvents,
  recordSaveClicked,
  recordSaveReasonSelected,
} from "../../lib/narrowEventFlow";
import { SAVE_REASON_OPTIONS, completeSaveSelection, initialSaveUiState } from "../../lib/narrowUiState";
import { persistNarrowSave } from "../../lib/narrowSaveStore";
import type { NarrowCardFixture } from "../../lib/narrowUiFixtures";

type Props = {
  card: NarrowCardFixture;
  saveContext: {
    governing_term: string;
    route: "READ";
    seed_class: "legal_civic" | "unsupported_unbounded_wrapper";
    card_state: "B" | null;
  };
};

export function ResultCard({ card, saveContext }: Props) {
  const [saveState, setSaveState] = useState(initialSaveUiState);
  const saveMenuId = useId();
  const firstSaveOptionRef = useRef<HTMLButtonElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    recordLaneOpenEvents(Boolean(card.lineage), Boolean(card.carrier));
  }, [card.lineage, card.carrier]);

  useEffect(() => {
    if (saveState.menuOpen) {
      firstSaveOptionRef.current?.focus();
    }
  }, [saveState.menuOpen]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!saveState.menuOpen) return;
      if (menuWrapRef.current && !menuWrapRef.current.contains(event.target as Node)) {
        setSaveState((current) => ({ ...current, menuOpen: false }));
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [saveState.menuOpen]);

  const saveLabel = useMemo(() => {
    if (!saveState.completed || !saveState.selectedReason) return "Save";
    return "Saved";
  }, [saveState.completed, saveState.selectedReason]);

  const copyText = async (lane: "meaning" | "use" | "lineage", text: string) => {
    recordCopyEvent(lane);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  };

  const toggleSaveMenu = () => {
    recordSaveClicked();
    setSaveState((current) => ({ ...current, menuOpen: !current.menuOpen }));
  };

  return (
    <article className="narrow-card" aria-live="polite">
      <header className="narrow-card-header">
        <h2>{card.governing_term}</h2>
        <div className="narrow-save-wrap" ref={menuWrapRef}>
          <button
            type="button"
            className="narrow-save"
            onClick={toggleSaveMenu}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setSaveState((current) => ({ ...current, menuOpen: false }));
              }
              if (event.key === "ArrowDown" && !saveState.menuOpen) {
                event.preventDefault();
                toggleSaveMenu();
              }
            }}
            aria-expanded={saveState.menuOpen}
            aria-haspopup="menu"
            aria-controls={saveMenuId}
          >
            {saveLabel}
          </button>
          {saveState.menuOpen && (
            <ul id={saveMenuId} className="narrow-save-menu" role="menu" aria-label="Save reason">
              {SAVE_REASON_OPTIONS.map((reason, index) => (
                <li key={reason}>
                  <button
                    ref={index === 0 ? firstSaveOptionRef : undefined}
                    type="button"
                    role="menuitemradio"
                    aria-checked={saveState.selectedReason === reason}
                    onClick={() => {
                      recordSaveReasonSelected(reason);
                      persistNarrowSave({
                        governing_term: saveContext.governing_term,
                        selected_canonical_save_reason: reason,
                        timestamp: Date.now(),
                        route: saveContext.route,
                        seed_class: saveContext.seed_class,
                        card_state: saveContext.card_state,
                      });
                      setSaveState(completeSaveSelection(reason));
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setSaveState((current) => ({ ...current, menuOpen: false }));
                      }
                    }}
                  >
                    {reason}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <section className="narrow-lane">
        <div className="narrow-lane-head">
          <h3>Meaning</h3>
          <button type="button" className="narrow-copy" onClick={() => void copyText("meaning", card.meaning)}>
            Copy
          </button>
        </div>
        <p>{card.meaning}</p>
      </section>

      <section className="narrow-lane">
        <div className="narrow-lane-head">
          <h3>Use</h3>
          <button type="button" className="narrow-copy" onClick={() => void copyText("use", card.use)}>
            Copy
          </button>
        </div>
        <p>{card.use}</p>
      </section>

      {card.lineage && (
        <section className="narrow-lane">
          <div className="narrow-lane-head">
            <h3>Lineage</h3>
            <button type="button" className="narrow-copy" onClick={() => void copyText("lineage", card.lineage)}>
              Copy
            </button>
          </div>
          <p>{card.lineage}</p>
        </section>
      )}

      {card.carrier && <aside className="narrow-carrier-inset">{card.carrier}</aside>}
    </article>
  );
}
