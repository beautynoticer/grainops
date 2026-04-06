import type { RecoveryPromptModel } from "../../types/meaning";

interface RecoveryPromptProps {
  prompt: RecoveryPromptModel;
  onClick?: () => void;
}

export function RecoveryPrompt({ prompt, onClick }: RecoveryPromptProps) {
  return (
    <section className={`mc-recovery ${prompt.mode}`}>
      <p>{prompt.text}</p>
      {prompt.ctaLabel && (
        <button type="button" onClick={onClick}>
          {prompt.ctaLabel}
        </button>
      )}
    </section>
  );
}
