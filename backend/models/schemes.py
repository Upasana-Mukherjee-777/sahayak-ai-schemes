from typing import List, Optional
from pydantic import BaseModel, Field

class SchemeSummary(BaseModel):
    id: str
    slug: str
    name: str
    level: str  # "Central" or "State"
    state: str
    application_mode: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category: Optional[str] = None
    description: Optional[str] = None
    benefits: Optional[str] = None
    eligibility_general: Optional[str] = None
    exclusions: Optional[str] = None
    documents_required: Optional[str] = None
    official_link: Optional[str] = None
    myscheme_url: Optional[str] = None

class SchemeDetail(SchemeSummary):
    eligibility_criteria: Optional[str] = None
    application_process: Optional[str] = None
    faqs: Optional[str] = None

class PagedSchemes(BaseModel):
    items: List[SchemeSummary]
    total: int
    page: int
    page_size: int
    total_pages: int

class DatasetMeta(BaseModel):
    total_schemes: int
    central_schemes: int
    state_schemes: int
    states: List[str]
    categories: List[str]
    last_imported_at: Optional[str] = None
    retrieval_date: Optional[str] = None
    source_name: str
    source_url: str
    reference_portal: str
    dataset_license: str
    disclaimer: str

class CitizenProfile(BaseModel):
    state: str
    age: int
    gender: Optional[str] = None
    education: Optional[str] = None
    occupation: Optional[str] = None
    income_range: Optional[str] = None
    residence: Optional[str] = None
    social_category: Optional[str] = None
    has_disability: bool = False
    disability_type: Optional[str] = None
    support_types: List[str] = Field(default_factory=list)

class ScoreComponent(BaseModel):
    component: str
    label: str
    weight: float
    score: float
    note: str

class RankedScheme(BaseModel):
    scheme: SchemeSummary
    score: int
    score_band: str  # "strong" | "moderate" | "low"
    components: List[ScoreComponent]
    why_matched: List[str]
    flags: List[str]
    matched_terms: List[str]

class RecommendationResponse(BaseModel):
    results: List[RankedScheme]
    total_schemes_searched: int
    excluded_other_state: int
    generated_at: str
    disclaimer: str

class AdminSession(BaseModel):
    username: str

class ImportReport(BaseModel):
    ok: bool
    message: str
    source_name: str
    total_imported: int
