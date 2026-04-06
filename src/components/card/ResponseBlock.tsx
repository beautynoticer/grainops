import type { ReactNode } from "react";

interface ResponseBlockProps {
  title: string;
  children: ReactNode;
}

export function ResponseBlock({ title, children }: ResponseBlockProps) {
  return (
    <section className="mc-response-block" aria-label={title}>
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}
