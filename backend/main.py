import os
import json
import math
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Query, Response, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models.schemes import (
    SchemeSummary,
    SchemeDetail,
    PagedSchemes,
    DatasetMeta,
    CitizenProfile,
    RecommendationResponse,
    AdminSession,
)
from .lib.recommender import rank_schemes

app = FastAPI(
    title="Sahayak AI Schemes API",
    description="Backend service for Indian welfare scheme discovery and explainable recommendation.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "schemes.json")
schemes_cache: List[dict] = []

def load_data():
    global schemes_cache
    if os.path.exists(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                schemes_cache = json.load(f)
        except Exception as e:
            print("Failed to load schemes.json:", e)
    if not schemes_cache:
        # Fallback initial sample schemes
        schemes_cache = [
            {
                "id": "pm-kisan",
                "slug": "pm-kisan-samman-nidhi",
                "name": "PM Kisan Samman Nidhi Yojana",
                "level": "Central",
                "state": "All",
                "application_mode": "Online",
                "tags": ["farmer", "financial assistance", "agriculture", "kisan"],
                "category": "agriculture",
                "description": "Financial benefit of Rs 6,000 per year in three equal installments to all landholding farmers families.",
                "benefits": "Rs 6,000 per annum paid directly to bank account in 3 installments of Rs 2,000 each.",
                "eligibility_general": "All landholding farmer families having cultivable land in their names.",
                "exclusions": "Institutional land holders, farmer families holding constitutional posts, retired or serving officers.",
                "documents_required": "Aadhaar, Land ownership papers, Bank account details.",
                "official_link": "https://pmkisan.gov.in/",
                "myscheme_url": "https://www.myscheme.gov.in/schemes/pm-kisan",
                "eligibility_criteria": "Cultivable land ownership registered in citizen's state land records.",
                "application_process": "Apply via official PM Kisan portal or common service centers (CSC).",
                "faqs": "Is Aadhaar mandatory? Yes."
            },
            {
                "id": "pm-matru-vandana",
                "slug": "pm-matru-vandana-yojana",
                "name": "Pradhan Mantri Matru Vandana Yojana",
                "level": "Central",
                "state": "All",
                "application_mode": "Online",
                "tags": ["women", "maternity", "health", "financial assistance"],
                "category": "women",
                "description": "Maternity benefit cash incentive provided to pregnant women and lactating mothers.",
                "benefits": "Cash incentive of Rs 5,000 directly to bank accounts in multiple installments.",
                "eligibility_general": "Pregnant women and lactating mothers for the first living child.",
                "exclusions": "Women in regular employment with Central/State Govts or PSUs.",
                "documents_required": "MCP card, Aadhaar, Bank passbook.",
                "official_link": "https://pmmvy.wcd.gov.in/",
                "myscheme_url": "https://www.myscheme.gov.in/schemes/pmmvy",
                "eligibility_criteria": "Age at least 19 years, first living child.",
                "application_process": "Register through nearest Anganwadi Centre or approved Health Facility.",
                "faqs": "How are funds disbursed? Directly via DBT."
            }
        ]

load_data()

@app.get("/api/meta", response_model=DatasetMeta)
def get_meta():
    total = len(schemes_cache)
    central = sum(1 for s in schemes_cache if s.get("level", "").lower() == "central" or s.get("state") in ["All", "", None])
    state_schemes = total - central
    states = sorted(list(set(s.get("state") for s in schemes_cache if s.get("state") and s.get("state") != "All")))
    categories = sorted(list(set(s.get("category") for s in schemes_cache if s.get("category"))))
    
    return DatasetMeta(
        total_schemes=total,
        central_schemes=central,
        state_schemes=state_schemes,
        states=states if states else ["All States & UTs"],
        categories=categories if categories else ["agriculture", "education", "health", "women", "welfare"],
        last_imported_at=datetime.now(timezone.utc).isoformat(),
        retrieval_date="2026-08-15",
        source_name="MyScheme portal snapshot (community dataset)",
        source_url="https://github.com/Aryan-Pardeshi/gov-myscheme-dataset",
        reference_portal="https://www.myscheme.gov.in/",
        dataset_license="Apache-2.0",
        disclaimer="Recommendations are preliminary text-based matches from a community snapshot of the MyScheme portal. Schemes, eligibility rules and benefits change frequently - always verify on the official scheme page before acting. A high ranking score does NOT mean you are eligible."
    )

@app.get("/api/schemes", response_model=PagedSchemes)
def list_schemes(
    q: Optional[str] = Query(None, description="Search query string"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    filtered = schemes_cache
    if q and q.strip():
        term = q.strip().lower()
        filtered = [
            s for s in schemes_cache
            if term in s.get("name", "").lower()
            or term in s.get("description", "").lower()
            or term in s.get("category", "").lower()
            or any(term in t.lower() for t in s.get("tags", []))
        ]

    total = len(filtered)
    total_pages = max(1, math.ceil(total / page_size))
    start = (page - 1) * page_size
    items = [SchemeSummary(**s) for s in filtered[start : start + page_size]]

    return PagedSchemes(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@app.get("/api/schemes/{slug}", response_model=SchemeDetail)
def get_scheme_by_slug(slug: str):
    for s in schemes_cache:
        if s.get("slug") == slug or s.get("id") == slug:
            return SchemeDetail(**s)
    raise HTTPException(status_code=404, detail="Scheme not found")

@app.post("/api/recommendations", response_model=RecommendationResponse)
def get_recommendations(profile: CitizenProfile):
    summaries = [SchemeSummary(**s) for s in schemes_cache]
    return rank_schemes(summaries, profile)

# Admin Auth Endpoints
class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/admin/login", response_model=AdminSession)
def admin_login(creds: LoginRequest, response: Response):
    if creds.username == "admin" and creds.password == "admin123":
        response.set_cookie(key="session", value="admin-token", httponly=True)
        return AdminSession(username="admin")
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post("/api/admin/logout")
def admin_logout(response: Response):
    response.delete_cookie(key="session")
    return {"message": "Logged out"}

@app.get("/api/admin/me", response_model=AdminSession)
def admin_me():
    return AdminSession(username="admin")
