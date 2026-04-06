import type { LoadBearingTokenModel } from "../../types/meaning";

interface WordDrilldownInlineProps {
  token: LoadBearingTokenModel;
  onClose: () => void;
}

export function WordDrilldownInline({ token, onClose }: WordDrilldownInlineProps) {
  return (
    <div className="mc-drilldown" role="region" aria-label={`Word detail for ${token.text}`}>
      <div className="mc-drilldown-header">
        <strong>{token.text}</strong>
        <button type="button" onClick={onClose} aria-label="Close word details">
          Close
        </button>
      </div>
      <ul>
        <li>
          <span>Local role</span>
          <p>{token.role}</p>
        </li>
        <li>
          <span>Environmental charge</span>
          <p>{token.environmentalCharge}</p>
        </li>
        <li>
          <span>Substitution ladder</span>
          <p>
            {token.ladder.thin?.join(" / ")} → {token.ladder.neutral?.join(" / ")} → {token.ladder.thick?.join(" / ")} → {token.ladder.extreme?.join(" / ")}
          </p>
        </li>
        <li>
          <span>Usage pattern</span>
          <p>{token.usagePatterns.join(", ")}</p>
        </li>
      </ul>
    </div>
  );
}
