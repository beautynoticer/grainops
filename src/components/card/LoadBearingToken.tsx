import type { LoadBearingTokenModel } from "../../types/meaning";

interface LoadBearingTokenProps {
  token: LoadBearingTokenModel;
  isActive: boolean;
  onClick: (token: LoadBearingTokenModel) => void;
}

export function LoadBearingToken({ token, isActive, onClick }: LoadBearingTokenProps) {
  return (
    <button
      type="button"
      className={`mc-token ${isActive ? "active" : ""}`}
      onClick={() => onClick(token)}
      aria-label={`Inspect ${token.text}`}
    >
      {token.text}
    </button>
  );
}
