import { LoadBearingToken } from "./LoadBearingToken";
import { WordDrilldownInline } from "./WordDrilldownInline";
import type { EnvironmentVariant, LoadBearingTokenModel } from "../../types/meaning";

interface EnvironmentVariantCardProps {
  variant: EnvironmentVariant;
  selectedTokenId?: string;
  onTokenClick: (token: LoadBearingTokenModel) => void;
  onCloseDrilldown: () => void;
}

export function EnvironmentVariantCard({ variant, selectedTokenId, onTokenClick, onCloseDrilldown }: EnvironmentVariantCardProps) {
  const selectedToken = variant.tokens.find((token) => token.id === selectedTokenId);

  return (
    <article className="mc-variant-card">
      <header>
        <h4>{variant.environmentLabel}</h4>
        {variant.constraintNote && <p className="mc-constraint-note">{variant.constraintNote}</p>}
      </header>
      <p>{variant.text}</p>
      <div className="mc-token-row">
        {variant.tokens.slice(0, 4).map((token) => (
          <LoadBearingToken key={token.id} token={token} isActive={token.id === selectedTokenId} onClick={onTokenClick} />
        ))}
      </div>
      {selectedToken && <WordDrilldownInline token={selectedToken} onClose={onCloseDrilldown} />}
    </article>
  );
}
