const examples = [
  "What was the meaning of 'good' in Genesis?",
  "Audit this: We value integrity, excellence, and respect in everything we do.",
  "I need people to take this seriously and not treat it casually.",
];

export function LandingAperture() {
  return (
    <section className="mc-landing">
      <h1>Meaning Chamber</h1>
      <p>One field. One voice. Find the word that can carry reality.</p>
      <ul>
        {examples.map((example) => (
          <li key={example}>{example}</li>
        ))}
      </ul>
    </section>
  );
}
