import type { ChargeBandView } from "../../types/meaning";

interface ChargeGradientFooterProps {
  coreInvariant: string;
  bands: ChargeBandView[];
  selectedBandId?: string;
  onSelect: (id: string) => void;
}

export function ChargeGradientFooter({ coreInvariant, bands, selectedBandId, onSelect }: ChargeGradientFooterProps) {
  return (
    <footer className="mc-charge-footer" aria-label="Charge calibration">
      <p className="mc-core">core: {coreInvariant}</p>
      <div className="mc-charge-bands">
        {bands.map((band) => (
          <button
            type="button"
            key={band.id}
            className={`mc-band ${selectedBandId === band.id ? "selected" : ""}`}
            onClick={() => onSelect(band.id)}
            aria-pressed={selectedBandId === band.id}
          >
            <strong>{band.label}</strong>
            <span>{band.examples.join(" · ")}</span>
          </button>
        ))}
      </div>
    </footer>
  );
}
