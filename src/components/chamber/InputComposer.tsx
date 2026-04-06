import { FormEvent, useState } from "react";

interface InputComposerProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function InputComposer({ onSubmit, disabled }: InputComposerProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  return (
    <form className="mc-composer" onSubmit={handleSubmit}>
      <textarea
        aria-label="Meaning Chamber input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Enter a sentence, quote, feeling, or text block..."
        rows={3}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        Enter Chamber
      </button>
    </form>
  );
}
