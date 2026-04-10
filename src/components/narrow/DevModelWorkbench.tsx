import { useMemo, useState } from "react";
import { PROVING_FIXTURES } from "../../lib/narrowFixtures";

const BUCKETS = [
  "directly_supported",
  "inferred",
  "distortion_risk",
  "decorative_surplus",
  "runtime_fidelity",
  "scope_discipline",
  "correction_worth_testing",
] as const;

type BucketKey = (typeof BUCKETS)[number];
type OutputReview = Record<BucketKey, string>;

const emptyReview = (): OutputReview => ({
  directly_supported: "",
  inferred: "",
  distortion_risk: "",
  decorative_surplus: "",
  runtime_fidelity: "",
  scope_discipline: "",
  correction_worth_testing: "",
});

export function DevModelWorkbench() {
  const [fixtureId, setFixtureId] = useState(PROVING_FIXTURES[0].fixture_id);
  const [outputs, setOutputs] = useState<Array<{ modelName: string; output: string; review: OutputReview }>>([
    { modelName: "model-a", output: "", review: emptyReview() },
    { modelName: "model-b", output: "", review: emptyReview() },
  ]);

  const fixture = useMemo(
    () => PROVING_FIXTURES.find((item) => item.fixture_id === fixtureId) ?? PROVING_FIXTURES[0],
    [fixtureId],
  );

  return (
    <section className="narrow-dev-workbench" aria-label="Model comparison workbench">
      <h3>Model comparison workbench (dev-only)</h3>
      <div className="narrow-dev-row">
        <label htmlFor="workbench-fixture">Fixture</label>
        <select id="workbench-fixture" value={fixtureId} onChange={(event) => setFixtureId(event.target.value)}>
          {PROVING_FIXTURES.map((item) => (
            <option key={item.fixture_id} value={item.fixture_id}>
              {item.fixture_id}
            </option>
          ))}
        </select>
      </div>

      <pre className="narrow-dev-context">{JSON.stringify({ fixture_context: fixture }, null, 2)}</pre>

      {outputs.map((entry, index) => (
        <article key={`${entry.modelName}-${index}`} className="narrow-dev-output">
          <input
            value={entry.modelName}
            onChange={(event) =>
              setOutputs((current) =>
                current.map((item, i) => (i === index ? { ...item, modelName: event.target.value } : item)),
              )
            }
            placeholder="Model name"
          />
          <textarea
            value={entry.output}
            onChange={(event) =>
              setOutputs((current) =>
                current.map((item, i) => (i === index ? { ...item, output: event.target.value } : item)),
              )
            }
            placeholder="Paste model output for this fixture"
          />

          <div className="narrow-dev-buckets">
            {BUCKETS.map((bucket) => (
              <label key={bucket}>
                {bucket}
                <textarea
                  value={entry.review[bucket]}
                  onChange={(event) =>
                    setOutputs((current) =>
                      current.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              review: {
                                ...item.review,
                                [bucket]: event.target.value,
                              },
                            }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            ))}
          </div>
        </article>
      ))}

      <button
        type="button"
        onClick={() => setOutputs((current) => [...current, { modelName: `model-${current.length + 1}`, output: "", review: emptyReview() }])}
      >
        Add model output
      </button>
    </section>
  );
}
