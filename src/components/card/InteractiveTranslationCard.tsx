import { useMemo, useState } from "react";
import { ChargeGradientFooter } from "./ChargeGradientFooter";
import { EnvironmentVariantCard } from "./EnvironmentVariantCard";
import { ModernRewritePanel } from "./ModernRewritePanel";
import { RecoveryPrompt } from "./RecoveryPrompt";
import { ResponseBlock } from "./ResponseBlock";
import { VerdictLine } from "./VerdictLine";
import type { LoadBearingTokenModel, TranslationCardResult } from "../../types/meaning";

interface InteractiveTranslationCardProps {
  result: TranslationCardResult;
  onTokenClick: (tokenId: string) => void;
  onChargeSelect: (chargeId: string) => void;
  onFollowup: (prompt: string) => void;
}

export function InteractiveTranslationCard({ result, onTokenClick, onChargeSelect, onFollowup }: InteractiveTranslationCardProps) {
  const [selectedToken, setSelectedToken] = useState<LoadBearingTokenModel | null>(null);
  const [selectedBandId, setSelectedBandId] = useState(result.chargeBands?.[1]?.id);

  const modernRewrite = useMemo(() => {
    const selectedBand = result.chargeBands?.find((band) => band.id === selectedBandId);
    return selectedBand?.updatedRewrite ?? result.modernRewrite;
  }, [result.chargeBands, result.modernRewrite, selectedBandId]);

  const handleTokenClick = (token: LoadBearingTokenModel) => {
    setSelectedToken((current) => (current?.id === token.id ? null : token));
    onTokenClick(token.id);
  };

  const handleChargeSelect = (bandId: string) => {
    setSelectedBandId(bandId);
    onChargeSelect(bandId);
  };

  return (
    <article className="mc-card">
      <header className="mc-card-header">
        <h2>{result.governingLine}</h2>
        <VerdictLine verdict={result.verdict} />
      </header>

      <ResponseBlock title="The Thing">
        <p>{result.theThing}</p>
      </ResponseBlock>

      <ResponseBlock title="The World">
        <p>{result.theWorld}</p>
      </ResponseBlock>

      <ResponseBlock title="How That World Says It">
        <div className="mc-variants">
          {result.variants.map((variant) => (
            <EnvironmentVariantCard
              key={variant.id}
              variant={variant}
              selectedTokenId={selectedToken?.id}
              onTokenClick={handleTokenClick}
              onCloseDrilldown={() => setSelectedToken(null)}
            />
          ))}
        </div>
      </ResponseBlock>

      <ResponseBlock title="The Gap">
        <p>{result.gap}</p>
      </ResponseBlock>

      {result.coreInvariant && result.chargeBands && (
        <ChargeGradientFooter
          coreInvariant={result.coreInvariant}
          bands={result.chargeBands}
          selectedBandId={selectedBandId}
          onSelect={handleChargeSelect}
        />
      )}

      <ModernRewritePanel text={modernRewrite} />
      <RecoveryPrompt prompt={result.recoveryPrompt} onClick={() => onFollowup(result.recoveryPrompt.text)} />
    </article>
  );
}
