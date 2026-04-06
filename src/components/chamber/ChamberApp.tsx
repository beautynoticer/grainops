import { useState } from "react";
import { ConversationView } from "./ConversationView";
import { InputComposer } from "./InputComposer";
import { LandingAperture } from "./LandingAperture";
import { interpretInput } from "../../lib/interpretation";
import type { ChamberMemory, InterpretRequest, TranslationCardResult } from "../../types/meaning";

const initialMemory: ChamberMemory = {
  provisionalSubstitutions: [],
};

export function ChamberApp() {
  const [memory, setMemory] = useState<ChamberMemory>(initialMemory);
  const [results, setResults] = useState<TranslationCardResult[]>([]);

  const runInterpretation = (input: string, overrides?: Partial<InterpretRequest>) => {
    const mutableMemory: ChamberMemory = {
      ...memory,
      provisionalSubstitutions: [...memory.provisionalSubstitutions],
    };

    const { result } = interpretInput(
      {
        input,
        selectedChargeBandId: overrides?.selectedChargeBandId,
        selectedEnvironmentIds: overrides?.selectedEnvironmentIds,
      },
      mutableMemory,
    );

    setMemory(mutableMemory);
    setResults((current) => [...current, result]);
  };

  return (
    <main className="mc-shell">
      <div className="mc-frame">
        <LandingAperture />
        <InputComposer onSubmit={(value) => runInterpretation(value)} />
        <ConversationView
          results={results}
          onTokenClick={() => undefined}
          onChargeSelect={(chargeId) => {
            const last = results.at(-1);
            if (last) runInterpretation(last.theThing, { selectedChargeBandId: chargeId });
          }}
          onFollowup={(prompt) => runInterpretation(prompt)}
        />
        {memory.provisionalSubstitutions.length > 0 && (
          <aside className="mc-provisional">
            <strong>Provisional substitutions for review:</strong>
            <ul>
              {memory.provisionalSubstitutions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </main>
  );
}
