import { useMemo, useState, useSyncExternalStore } from "react";
import { getCanonicalEventLog, subscribeCanonicalEventLog } from "../../lib/narrowEventLog";
import { FIXTURE_OPTIONS, inspectFixture } from "../../lib/narrowInspection";
import { getNarrowSaves, subscribeNarrowSaves } from "../../lib/narrowSaveStore";
import { DevModelWorkbench } from "./DevModelWorkbench";

export function DevInspectionPanel() {
  const [selectedFixtureId, setSelectedFixtureId] = useState(FIXTURE_OPTIONS[0]);
  const events = useSyncExternalStore(subscribeCanonicalEventLog, getCanonicalEventLog, getCanonicalEventLog);
  const saves = useSyncExternalStore(subscribeNarrowSaves, getNarrowSaves, getNarrowSaves);

  const report = useMemo(
    () => ({
      ...inspectFixture(selectedFixtureId),
      emitted_event_log: events.map((entry) => entry.name),
      persisted_narrow_saves: saves,
    }),
    [selectedFixtureId, events, saves],
  );

  return (
    <section className="narrow-dev-panel" aria-label="Dev inspection">
      <div className="narrow-dev-row">
        <label htmlFor="dev-fixture">Fixture</label>
        <select id="dev-fixture" value={selectedFixtureId} onChange={(event) => setSelectedFixtureId(event.target.value)}>
          {FIXTURE_OPTIONS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <pre>{JSON.stringify(report, null, 2)}</pre>
      <DevModelWorkbench />
    </section>
  );
}
