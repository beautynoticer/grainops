interface ModernRewritePanelProps {
  text?: string;
}

export function ModernRewritePanel({ text }: ModernRewritePanelProps) {
  if (!text) return null;

  return (
    <section className="mc-modern-rewrite" aria-label="Modern rewrite">
      <h3>Modern Rewrite</h3>
      <p>{text}</p>
    </section>
  );
}
