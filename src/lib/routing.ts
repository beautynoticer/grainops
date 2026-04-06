import type { RouteDecision, RouteType } from "../types/meaning";

const routePatterns: Array<{ route: RouteType; patterns: RegExp[] }> = [
  { route: "semantic_audit", patterns: [/\baudit\b/i, /\bmission\b/i, /\bpolicy\b/i] },
  { route: "cultural_influence_tracing", patterns: [/where did/i, /hear that/i, /lineage/i] },
  { route: "cross_cultural_navigation", patterns: [/travel/i, /phrases shift/i, /cross[- ]cultural/i] },
  { route: "environment_reconstruction", patterns: [/meaning of/i, /what did .* mean/i] },
  { route: "translation_across_worlds", patterns: [/court/i, /war/i, /roman magistrate/i] },
  { route: "word_finding", patterns: [/what word am i/i, /word.*looking for/i] },
  { route: "creative_expression", patterns: [/how can i describe/i, /how do i say/i] },
];

export const classifyRoute = (input: string): RouteDecision => {
  const matched = routePatterns.filter(({ patterns }) => patterns.some((pattern) => pattern.test(input)));

  if (matched.length === 0) {
    return { route: "mixed_query", confidence: 0.45, needsClarification: false };
  }

  if (matched.length === 1) {
    return { route: matched[0].route, confidence: 0.82, needsClarification: false };
  }

  return {
    route: matched[0].route,
    confidence: 0.67,
    secondaryRoutes: matched.slice(1).map(({ route }) => route),
    needsClarification: false,
  };
};
