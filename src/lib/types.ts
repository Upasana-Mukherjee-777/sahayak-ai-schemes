// Hand-written mirrors of the Pydantic models in backend/models/schemes.py —
// nothing infers across the HTTP boundary; keep the two in sync in the same edit.

export interface SchemeSummary {
  id: string;
  slug: string;
  name: string;
  level: string;
  state: string;
  application_mode: string | null;
  tags: string[];
  category: string | null;
  description: string | null;
  benefits: string | null;
  eligibility_general: string | null;
  exclusions: string | null;
  documents_required: string | null;
  official_link: string | null;
  myscheme_url: string | null;
}

export interface SchemeDetail extends SchemeSummary {
  eligibility_criteria: string | null;
  application_process: string | null;
  faqs: string | null;
}

export interface PagedSchemes {
  items: SchemeSummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DatasetMeta {
  total_schemes: number;
  central_schemes: number;
  state_schemes: number;
  states: string[];
  categories: string[];
  last_imported_at: string | null;
  retrieval_date: string | null;
  source_name: string;
  source_url: string;
  reference_portal: string;
  dataset_license: string;
  disclaimer: string;
}

export interface CitizenProfile {
  state: string;
  age: number;
  gender: string | null;
  education: string | null;
  occupation: string | null;
  income_range: string | null;
  residence: string | null;
  social_category: string | null;
  has_disability: boolean;
  disability_type: string | null;
  support_types: string[];
}

export type ScoreBand = "strong" | "moderate" | "low";

export interface ScoreComponent {
  component: string;
  label: string;
  weight: number;
  score: number;
  note: string;
}

export interface RankedScheme {
  scheme: SchemeSummary;
  score: number;
  score_band: ScoreBand;
  components: ScoreComponent[];
  why_matched: string[];
  flags: string[];
  matched_terms: string[];
}

export interface RecommendationResponse {
  results: RankedScheme[];
  total_schemes_searched: number;
  excluded_other_state: number;
  generated_at: string;
  disclaimer: string;
}

export interface AdminSession {
  username: string;
}

export interface ImportReport {
  ok: boolean;
  message: string;
  source_name: string;
  rows_read: number;
  rows_imported: number;
  duplicates_removed: number;
  invalid_rows_removed: number;
  schema_ok: boolean;
  missing_columns: string[];
  extra_columns: string[];
  missing_values: Record<string, number>;
  imported_at: string | null;
}

export interface SchemaColumnReport {
  column: string;
  field: string;
  present: boolean;
  missing_count: number;
  missing_pct: number;
}

export interface DatasetReport {
  record_count: number;
  levels: Record<string, number>;
  schema_columns: SchemaColumnReport[];
  duplicates: Record<string, number>;
  last_imported_at: string | null;
  retrieval_date: string | null;
  source_name: string;
  source_url: string;
  bundled_file_available: boolean;
}
