import re
from datetime import datetime, timezone
from typing import List, Tuple, Dict, Any
from ..models.schemes import (
    SchemeSummary,
    CitizenProfile,
    RankedScheme,
    ScoreComponent,
    RecommendationResponse
)

KEYWORD_MAP: Dict[str, List[str]] = {
    "education & scholarships": ["scholarship", "education", "student", "study", "tuition", "school", "college", "fellowship", "academic"],
    "livelihood & employment": ["employment", "job", "livelihood", "wage", "work", "unemployed", "career", "placement", "internship"],
    "agriculture & farmers": ["farmer", "agriculture", "crop", "krishi", "kisan", "farming", "dairy", "fisheries", "horticulture", "irrigation"],
    "healthcare & insurance": ["health", "medical", "hospital", "insurance", "ayushman", "treatment", "medicine", "wellness", "doctor"],
    "housing": ["housing", "house", "awas", "home", "shelter", "construction", "residential"],
    "pension & social security": ["pension", "retirement", "social security", "elderly", "destitute", "widow"],
    "entrepreneurship & business loans": ["business", "loan", "entrepreneur", "startup", "msme", "credit", "enterprise", "mudra"],
    "skill development & training": ["skill", "training", "vocational", "capacity", "upskilling", "apprentice"],
    "financial assistance & compensation": ["financial assistance", "subsidy", "grant", "compensation", "relief", "cash", "allowance"],
    "women & child welfare": ["women", "girl", "child", "maternity", "mother", "matru", "mahila", "beti", "infant"],
    "food & nutrition": ["food", "ration", "nutrition", "grain", "poshan", "diet", "meal"],
    "water, sanitation & electricity": ["water", "sanitation", "toilet", "electricity", "swachh", "jal", "clean energy"],
    "disability welfare & rehabilitation": ["disability", "disabled", "divyang", "handicap", "wheelchair", "assistive", "impairment"],
    "senior citizen care": ["senior citizen", "elderly", "aged", "geriatric", "vridha"],
    "sports & culture": ["sports", "culture", "athletic", "arts", "heritage", "youth"],
    "marriage & family support": ["marriage", "wedding", "vivah", "kalyanam", "family"],
}

def rank_schemes(schemes: List[SchemeSummary], profile: CitizenProfile) -> RecommendationResponse:
    ranked: List[RankedScheme] = []
    excluded_other_state = 0
    now_str = datetime.now(timezone.utc).isoformat()
    
    # Pre-calculate search keywords for the citizen
    citizen_terms = set()
    for support in profile.support_types:
        s_lower = support.lower()
        if s_lower in KEYWORD_MAP:
            citizen_terms.update(KEYWORD_MAP[s_lower])
        else:
            citizen_terms.add(s_lower)
            
    if profile.occupation:
        citizen_terms.add(profile.occupation.lower())
    if profile.social_category:
        citizen_terms.add(profile.social_category.lower())

    for s in schemes:
        # State filtering: central applies to all; state must match
        is_central = s.level.lower() == "central" or not s.state or s.state.lower() == "all"
        state_matches = (s.state and s.state.lower() == profile.state.lower())

        if not is_central and not state_matches:
            excluded_other_state += 1
            continue

        searchable_text = f"{s.name} {s.category or ''} {s.description or ''} {s.benefits or ''} {' '.join(s.tags)} {s.eligibility_general or ''}".lower()

        # 1. Needs relevance (weight 35)
        matched_words = [w for w in citizen_terms if re.search(r'\b' + re.escape(w) + r'\b', searchable_text)]
        if matched_words:
            needs_raw = min(100, int(len(matched_words) * 25 + 15))
            needs_note = f"Matches your stated needs ({', '.join(matched_words[:3])})."
        else:
            needs_raw = 10
            needs_note = "General welfare scheme with partial overlap."

        # 2. State fit (weight 20)
        if state_matches:
            state_raw = 100
            state_note = f"State scheme specific to {profile.state}."
        else:
            state_raw = 85
            state_note = "Central (national) scheme — applies across India."

        # 3. Age fit (weight 15)
        age_raw = 50
        age_note = "No specific age constraints detected."
        # Simple heuristic check for age numbers
        age_match = re.search(r'(\d{1,2})\s*(?:to|-)\s*(\d{1,2})\s*years?', searchable_text)
        if age_match:
            min_a, max_a = int(age_match.group(1)), int(age_match.group(2))
            if min_a <= profile.age <= max_a:
                age_raw = 100
                age_note = f"Age fits specified range ({min_a} to {max_a} years)."
            else:
                age_raw = 20
                age_note = f"Age may be outside range ({min_a} to {max_a} years)."
        elif "senior" in searchable_text:
            if profile.age >= 60:
                age_raw = 100
                age_note = "Senior citizen criterion met."
            else:
                age_raw = 25
                age_note = "Scheme targeted at senior citizens."

        # 4. Income fit (weight 10)
        income_raw = 50
        income_note = "Standard income conditions apply — verify officially."
        if any(term in searchable_text for term in ["bpl", "poverty", "below poverty", "low income"]):
            if profile.income_range in ["Below Rs. 50,000", "Rs. 50,000 - 1,00,000"]:
                income_raw = 100
                income_note = "Income range aligns with scheme poverty-line criterion."
            else:
                income_raw = 30
                income_note = "Scheme has strict low-income / BPL requirements."

        # 5. Gender fit (weight 10)
        gender_raw = 50
        gender_note = "Open to all genders."
        if any(term in searchable_text for term in ["women", "girl", "female", "mahila"]):
            if profile.gender and profile.gender.lower() in ["female", "woman"]:
                gender_raw = 100
                gender_note = "Scheme specifically supports women and girls."
            else:
                gender_raw = 15
                gender_note = "Scheme is prioritized for female beneficiaries."

        # 6. Social category (weight 5)
        cat_raw = 50
        cat_note = "No special social-category restriction detected."
        if profile.social_category and profile.social_category.lower() in ["sc", "st", "obc"]:
            if profile.social_category.lower() in searchable_text:
                cat_raw = 100
                cat_note = f"Scheme prioritizes {profile.social_category} applicants."

        # 7. Residence (weight 5)
        res_raw = 50
        res_note = "No specific rural/urban condition detected."
        if profile.residence and profile.residence.lower() in ["rural", "urban"]:
            if profile.residence.lower() in searchable_text:
                res_raw = 100
                res_note = f"Scheme is focused on {profile.residence.lower()} areas."

        components = [
            ScoreComponent(component="needs", label="Text relevance to your stated needs", weight=35, score=needs_raw, note=needs_note),
            ScoreComponent(component="state", label="State / coverage fit", weight=20, score=state_raw, note=state_note),
            ScoreComponent(component="age", label="Age condition from scheme text", weight=15, score=age_raw, note=age_note),
            ScoreComponent(component="income", label="Income condition from scheme text", weight=10, score=income_raw, note=income_note),
            ScoreComponent(component="gender", label="Gender focus of the scheme", weight=10, score=gender_raw, note=gender_note),
            ScoreComponent(component="category", label="Social category focus", weight=5, score=cat_raw, note=cat_note),
            ScoreComponent(component="residence", label="Rural / urban focus", weight=5, score=res_raw, note=res_note),
        ]

        total_score = round(sum((c.score * c.weight) / 100 for c in components))
        band = "strong" if total_score >= 60 else ("moderate" if total_score >= 40 else "low")

        why_matched = [c.note for c in components if c.score >= 80]
        flags = [c.note for c in components if c.score <= 30]

        ranked.append(RankedScheme(
            scheme=s,
            score=total_score,
            score_band=band,
            components=components,
            why_matched=why_matched,
            flags=flags,
            matched_terms=matched_words[:5]
        ))

    # Sort descending by score
    ranked.sort(key=lambda x: x.score, reverse=True)

    return RecommendationResponse(
        results=ranked[:60],
        total_schemes_searched=len(schemes),
        excluded_other_state=excluded_other_state,
        generated_at=now_str,
        disclaimer="Preliminary results only — always verify eligibility on the official portal."
    )
