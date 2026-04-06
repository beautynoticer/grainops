export type RouteType =
  | "environment_reconstruction"
  | "word_finding"
  | "semantic_audit"
  | "cultural_influence_tracing"
  | "cross_cultural_navigation"
  | "creative_expression"
  | "translation_across_worlds"
  | "mixed_query";

export type DiagnosisState =
  | "wrong_word"
  | "right_word_wrong_world"
  | "right_word_missing_context"
  | "mixed";

export interface RouteDecision {
  route: RouteType;
  confidence: number;
  secondaryRoutes?: RouteType[];
  needsClarification: boolean;
  clarificationQuestion?: string;
}

export interface DiagnosisResult {
  primary: DiagnosisState;
  secondary?: DiagnosisState[];
  rationale: string[];
  affectedTokens?: string[];
}

export interface EnvironmentProfile {
  id: string;
  name: string;
  constraintField: string;
  atmosphericTone: string;
  actionArena: string;
  continuityStorage: string[];
  transmissionMechanism: string[];
  auctoritasGradient: string[];
  maintenanceLoop: string[];
  institutions: string[];
  carriers: string[];
  obligations: string[];
  consequences: string[];
  notes?: string;
}

export interface SourceAnchorView {
  id: string;
  kind: "quote" | "text" | "artifact" | "ritual" | "institution" | "scholarship";
  citation?: string;
  note: string;
  confidence: "verified" | "inferred" | "uncertain";
}

export interface LoadBearingTokenModel {
  id: string;
  text: string;
  role: string;
  environmentalCharge: string;
  ladder: {
    thin?: string[];
    neutral?: string[];
    thick?: string[];
    extreme?: string[];
  };
  usagePatterns: string[];
  neighboringTerms?: string[];
  confidence: "verified" | "inferred" | "uncertain";
  sourceAnchorIds?: string[];
}

export interface EnvironmentVariant {
  id: string;
  environmentId: string;
  environmentLabel: string;
  text: string;
  tokens: LoadBearingTokenModel[];
  gains?: string;
  losses?: string;
  constraintNote?: string;
}

export interface ChargeBandView {
  id: string;
  label: string;
  examples: string[];
  note?: string;
  environments?: string[];
  updatedRewrite?: string;
}

export interface RecoveryPromptModel {
  mode: "question" | "path" | "warning";
  text: string;
  ctaLabel?: string;
}

export interface TranslationCardResult {
  route: RouteType;
  diagnosis: DiagnosisResult;
  governingLine: string;
  verdict: string;
  theThing: string;
  theWorld: string;
  variants: EnvironmentVariant[];
  gap: string;
  coreInvariant?: string;
  chargeBands?: ChargeBandView[];
  modernRewrite?: string;
  recoveryPrompt: RecoveryPromptModel;
  sourceAnchors?: SourceAnchorView[];
}

export interface ChamberMemory {
  governingTerm?: string;
  chosenEnvironmentId?: string;
  chosenChargeBandId?: string;
  clarifiedContext?: string;
  provisionalSubstitutions: string[];
}

export interface InterpretRequest {
  input: string;
  conversationId?: string;
  selectedEnvironmentIds?: string[];
  selectedChargeBandId?: string;
  context?: {
    priorTurns?: string[];
    locale?: string;
    audience?: string;
  };
}

export interface InterpretResponse {
  routeDecision: RouteDecision;
  result: TranslationCardResult;
}

export interface SubstituteMapEntry {
  thin: string[];
  governing: string;
  costOfSubstitution: string;
  environmentalDifferences: string[];
  evidenceExamples: string[];
  confidence: "verified" | "inferred" | "provisional";
  createdBy: "editor" | "model";
  status: "active" | "review" | "rejected";
}
