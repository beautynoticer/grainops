interface VerdictLineProps {
  verdict: string;
}

export function VerdictLine({ verdict }: VerdictLineProps) {
  return <p className="mc-verdict">{verdict}</p>;
}
