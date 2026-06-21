export interface MaterialComponent {
  name: string;
  percentage: number;
}

export interface WasteCategoryInfo {
  name: string;
  color: string;
  emoji: string;
  disposal: string;
  facts: string[];
  badgeClass: string;
  hoverBorder: string;
  bgLight: string;
  definition: string;
  examples: string[];
  disposalSteps: string[];
  environmentalImpact: string;
  recyclingChallenges: string;
  reductionTips: string[];
}

export interface ClassifyResponse {
  category: string;
  confidence: number;
  detected_items: string[];
  reasoning: string;
  composition: MaterialComponent[];
  recyclability: "High" | "Medium" | "Low" | "Not Recyclable";
  decomposition_time: string;
  environmental_risk: "Low" | "Medium" | "High" | "Critical";
  sustainability_score: number;
  reuse_ideas: string[];
  local_disposal_note: string;
}

export interface SingleImageResult {
  imageUrl: string;
  category: string;
  confidence: number;
  detected_items: string[];
  reasoning: string;
  composition: MaterialComponent[];
  recyclability: "High" | "Medium" | "Low" | "Not Recyclable";
  decomposition_time: string;
  environmental_risk: "Low" | "Medium" | "High" | "Critical";
  sustainability_score: number;
  reuse_ideas: string[];
  local_disposal_note: string;
}

export interface MultiClassifyResponse {
  results: SingleImageResult[];
  summary: Record<string, number>;
  totalItems: number;
}
