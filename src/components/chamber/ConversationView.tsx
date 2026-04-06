import { InteractiveTranslationCard } from "../card/InteractiveTranslationCard";
import type { TranslationCardResult } from "../../types/meaning";

interface ConversationViewProps {
  results: TranslationCardResult[];
  onTokenClick: (tokenId: string) => void;
  onChargeSelect: (chargeId: string) => void;
  onFollowup: (prompt: string) => void;
}

export function ConversationView({ results, onTokenClick, onChargeSelect, onFollowup }: ConversationViewProps) {
  if (!results.length) return null;

  return (
    <section className="mc-conversation" aria-label="Conversation view">
      {results.map((result, index) => (
        <InteractiveTranslationCard
          key={`${result.governingLine}-${index}`}
          result={result}
          onTokenClick={onTokenClick}
          onChargeSelect={onChargeSelect}
          onFollowup={onFollowup}
        />
      ))}
    </section>
  );
}
