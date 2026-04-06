import type { DiagnosisResult, DiagnosisState } from "../types/meaning";

const includesAny = (input: string, words: string[]) => words.some((word) => input.toLowerCase().includes(word));

export const classifyDiagnosis = (input: string): DiagnosisResult => {
  const lowered = input.toLowerCase();

  let primary: DiagnosisState = "wrong_word";
  const secondary: DiagnosisState[] = [];

  if (includesAny(lowered, ["where did", "hold space", "what did", "meaning of"])) {
    primary = "right_word_missing_context";
  } else if (includesAny(lowered, ["used to", "world", "carry it", "institution"])) {
    primary = "right_word_wrong_world";
  } else if (includesAny(lowered, ["audit", "integrity", "excellence", "respect"])) {
    primary = "mixed";
    secondary.push("wrong_word", "right_word_wrong_world");
  }

  if (primary === "wrong_word" && includesAny(lowered, ["take this seriously", "respectful"])) {
    secondary.push("right_word_missing_context");
  }

  return {
    primary,
    secondary: secondary.length ? [...new Set(secondary)] : undefined,
    rationale: [
      primary === "wrong_word"
        ? "Current wording under-carries the stated reality."
        : primary === "right_word_wrong_world"
          ? "Term is viable, but carriers required to enforce it are absent."
          : primary === "right_word_missing_context"
            ? "Term is viable, but listener does not inhabit its source world."
            : "Input combines weak lexical choices and degraded carriers.",
    ],
  };
};
