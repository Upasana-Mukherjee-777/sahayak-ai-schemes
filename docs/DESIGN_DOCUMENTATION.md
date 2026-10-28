# 🏛️ Sahayak AI — Comprehensive Design & Architecture Documentation
**System Specification, UI/UX Wireframes, and Algorithmic Framework**

---

## 1. Executive Summary & Problem Space

### 1.1 The Challenge: The Welfare Information Crisis
The Government of India and State Governments allocate tens of thousands of crores annually to direct and indirect welfare initiatives spanning agriculture, higher education, maternal health, disability pensions, and rural housing. However, an estimated 40–55% of eligible beneficiaries fail to access these benefits due to:
1. **Information Fragmentation**: Policies and guidelines are dispersed across hundreds of central and state departmental websites with varying URL structures and formats.
2. **Eligibility Opaque Complexity**: Schemes contain conditional rules (e.g., land acreage limits, parental income ceilings, domicile requirements, and age criteria) that are difficult for citizens to interpret.
3. **Data Privacy Hesitation**: Citizens are reluctant to input sensitive credentials (such as Aadhaar numbers, phone numbers, or bank account statements) into private portals due to legitimate fears of data harvesting and fraud.
4. **AI Hallucination Hazards**: Standard generative AI chatbots (LLMs) frequently hallucinate non-existent government grants, obsolete criteria, or erroneous payout schedules, creating dangerous false expectations.

### 1.2 The Sahayak AI Solution
**Sahayak AI** is an open-source, digital public service discovery tool designed to eliminate welfare exclusion without compromising citizen privacy. 
- **100% Zero-PII Intake**: Never collects Aadhaar numbers, phone numbers, banking data, or scanned documents.
- **Explainable Multi-Criteria Engine**: Couples TF-IDF text similarity with deterministic rule-based scoring across 7 objective dimensions.
- **Truth Anchoring**: Provides direct links to official government portals (*e.g., myscheme.gov.in, pmkisan.gov.in*) where every applicant verifies criteria before applying.

---

## 2. Product Design & Information Architecture

### 2.1 Information Architecture (Sitemap)

```
[ Sahayak AI Navigation ]
   │
   ├── / (Home / Landing Page)
   │     ├── Hero Section with Value Proposition
   │     ├── Live Persona Match Simulator (Interactive Demo)
   │     ├── "How It Works" 3-Step Overview
   │     └── Transparency & Open Data Counters
   │
   ├── /find (Citizen Intake Wizard)
   │     ├── Step 1: Domicile & Demographics (State, Age, Gender)
   │     ├── Step 2: Socio-Economic Profile (Education, Occupation, Income)
   │     ├── Step 3: Social Category & Vulnerabilities (Caste, Disability)
   │     └── Step 4: Targeted Welfare Needs (Multi-select support categories)
   │
   ├── /results (Explainable Recommendations Feed)
   │     ├── Top Match Summary & Search Metrics
   │     ├── Ranked Scheme Cards (Strong / Moderate / Low)
   │     ├── 7-Dimension Score Breakdown Modal
   │     └── Direct Official Application Linkouts
   │
   ├── /explore (Catalogue Explorer)
   │     ├── Full-text search across 2,066 schemes
   │     ├── Multi-facet filters (Central/State, Categories)
   │     └── Scheme Detail Dialog with Eligibility & FAQ tabs
   │
   └── /personas (Pre-built Evaluation Profiles)
         └── Quick-test personas (e.g. Marginal Farmer, College Student, Rural Widow)
```

---

## 3. Visual Wireframes & UI Layouts

### 3.1 Wireframe: Landing Page & Live Persona Simulator (`/`)

```
+-------------------------------------------------------------------------------+
|  [Logo] Sahayak AI        Home    Find Schemes    Explore    Personas   [Admin] |
+-------------------------------------------------------------------------------+
|                                                                               |
|   [Digital Public Service · Open Source]                                      |
|   Find the government schemes you may be eligible for                         |
|   Private, transparent, explainable recommendations over 2,066+ schemes.      |
|                                                                               |
|   [  Find Your Schemes ->  ]     [ Browse Full Catalogue ]                    |
|                                                                               |
|   -------------------------------------------------------------------------   |
|   [STAT] 2,066 Schemes      [STAT] 527 Central Schemes    [STAT] 35 States/UT |
|   -------------------------------------------------------------------------   |
|                                                                               |
|   +-- INTERACTIVE PERSONA SIMULATOR --------------------------------------+   |
|   | Select persona: (o) Farmer in Bihar  ( ) Student in UP  ( ) Woman MSME |   |
|   |                                                                       |   |
|   | Match Output: PM Kisan Samman Nidhi (Score: 88% - Strong Match)       |   |
|   | Why: Matches agriculture needs + Bihar state + landholder criterion   |   |
|   +-----------------------------------------------------------------------+   |
|                                                                               |
|   [ How It Works: 1. Describe Profile -> 2. Transparent Rank -> 3. Apply ]    |
+-------------------------------------------------------------------------------+
```

### 3.2 Wireframe: Citizen Intake Wizard (`/find`)

```
+-------------------------------------------------------------------------------+
|  Step 1 of 4: Your Profile Basics                  [ Privacy Protected: No PII ]
+-------------------------------------------------------------------------------+
|                                                                               |
|   Select State / Union Territory:             Your Age:                       |
|   [ Uttar Pradesh                  v ]        [ 28                            ]
|                                                                               |
|   Gender:                                     Area of Residence:              |
|   [ Female                         v ]        [ (o) Rural    ( ) Urban        ]
|                                                                               |
|   Current Occupation:                         Annual Family Income:           |
|   [ Small / Marginal Farmer        v ]        [ Below Rs. 50,000            v ]
|                                                                               |
|   Highest Education Level:                    Social Category:                |
|   [ Senior Secondary (Class 12)    v ]        [ OBC                         v ]
|                                                                               |
|   What kind of support are you seeking? (Select all that apply)               |
|   [X] Agriculture & Farmers       [X] Financial Assistance                    |
|   [ ] Education & Scholarships    [ ] Housing & Shelter                       |
|   [ ] Healthcare & Insurance      [ ] Women & Child Welfare                   |
|                                                                               |
|   [ Clear Form ]                               [ View Eligible Schemes -> ]   |
+-------------------------------------------------------------------------------+
```

### 3.3 Wireframe: Explainable Match Results (`/results`)

```
+-------------------------------------------------------------------------------+
|  Recommendations for Farmer Profile (Uttar Pradesh · 28y · Rural)             |
|  2,066 schemes evaluated  ·  1,520 excluded (other states) ·  60 potential matches|
+-------------------------------------------------------------------------------+
|                                                                               |
|  +-- SCHEME CARD -----------------------------------------------------------+ |
|  | [Central]  PM Kisan Samman Nidhi Yojana            [ Score: 88% - STRONG ] |
|  | Direct income support of Rs 6,000 per year in 3 installments to farmers. | |
|  |                                                                          | |
|  | [Tag: Agriculture] [Tag: Direct Benefit Transfer]                        | |
|  |                                                                          | |
|  | WHY IT MATCHED:                                                          | |
|  | * Stated Need: High keyword overlap with 'farmer', 'agriculture', 'crop'  | |
|  | * State Coverage: Central scheme applicable across Uttar Pradesh        | |
|  | * Income Bracket: Within BPL agricultural guidelines                    | |
|  |                                                                          | |
|  | [ View Score Breakdown (7 Factors) ]      [ Official Application Portal ]| |
|  +--------------------------------------------------------------------------+ |
|                                                                               |
+-------------------------------------------------------------------------------+
```

### 3.4 Wireframe: 7-Factor Score Breakdown Modal

```
+-------------------------------------------------------------------------------+
|  Scoring Explainability Analysis: PM Kisan Samman Nidhi                       |
+-------------------------------------------------------------------------------+
|  Criterion           Weight    Score     Status Notes                         |
|  ---------------------------------------------------------------------------  |
|  1. Needs Overlap     35%      90/100    Matched keywords: farmer, crop, agri |
|  2. State Fit         20%      85/100    Central initiative valid nationwide  |
|  3. Age Criterion     15%     100/100    Applicant age 28 satisfies >=18 rule |
|  4. Income Fit        10%     100/100    Poverty-line criterion satisfied     |
|  5. Gender Focus      10%      50/100    Neutral scheme (open to all genders) |
|  6. Social Category    5%      50/100    General category; no reservation cap |
|  7. Residence (Rural)  5%     100/100    Scheme specifically targets rural    |
|  ---------------------------------------------------------------------------  |
|  FINAL COMPOSITE SCORE: 88/100 [ STRONG MATCH BAND ]                          |
|                                                                               |
|  [!] CAUTIONARY NOTICE: Preliminary match only. Final approval requires       |
|      verification of cultivable land records by state revenue authorities.    |
|                                                                               |
|  [ Close Modal ]                              [ Open pmkisan.gov.in -> ]       |
+-------------------------------------------------------------------------------+
```

---

## 4. Technical System Architecture

```
                    +------------------------------------------+
                    |          CLIENT BROWSER (User)           |
                    |   React 19 + TypeScript + Tailwind v4    |
                    +--------------------+---------------------+
                                         |
                                         | HTTPS (JSON)
                                         v
                    +------------------------------------------+
                    |           REVERSE PROXY / VITE           |
                    |     (Port 3000 /api proxy routing)       |
                    +--------------------+---------------------+
                                         |
                                         | Localhost / Internal IPC
                                         v
                    +------------------------------------------+
                    |          FASTAPI BACKEND SERVICE         |
                    |      (Python 3.10+ ASGI at :8001)        |
                    +--------------------+---------------------+
                                         |
              +--------------------------+--------------------------+
              |                                                     |
              v                                                     v
+-----------------------------+                       +-----------------------------+
|   7-FACTOR SCORING ENGINE   |                       |    OFFLINE SCHEME CATALOG   |
|   * TF-IDF & Cosine Match   | <-------------------  |    * 2,066 Curated Schemes  |
|   * Rule-Based Pre-filter   |                       |    * JSON Schema Indexed    |
|   * Explainability Builder  |                       |    * Category & State Trees |
+-----------------------------+                       +-----------------------------+
```

---

## 5. Mathematical Algorithm Specification

### 5.1 Formulation
The recommendation score $S(c, s)$ of scheme $s$ for citizen profile $c$ is a convex linear combination of 7 discrete evaluation functions:

$$S(c, s) = \sum_{i=1}^{7} w_i \cdot f_i(c, s)$$

Subject to the normalization constraint:
$$\sum_{i=1}^{7} w_i = 100 \quad \text{where } w_i \ge 0$$

### 5.2 Criteria Weight Matrix

| $i$ | Factor Name | Symbol | Weight ($w_i$) | Scoring Logic $f_i(c, s) \in [0, 100]$ |
| :---: | :--- | :---: | :---: | :--- |
| **1** | **Needs Relevance** | $f_{\text{needs}}$ | **35%** | Cosine similarity over TF-IDF vectors of query needs vs. scheme text/tags. |
| **2** | **State Jurisdiction** | $f_{\text{state}}$ | **20%** | $100$ if state scheme matches citizen domicile; $85$ if Central; $0$ (excluded) if other state. |
| **3** | **Age Boundary** | $f_{\text{age}}$ | **15%** | $100$ if $\text{Age}_{\min} \le \text{age} \le \text{Age}_{\max}$; $20$ if out of bounds; $50$ if unspecified. |
| **4** | **Income Threshold** | $f_{\text{income}}$| **10%** | $100$ if low-income bracket matches BPL/subsidy rules; $50$ if unrestricted. |
| **5** | **Gender Focus** | $f_{\text{gender}}$| **10%** | $100$ if targeted program matches applicant gender; $50$ if gender-neutral. |
| **6** | **Social Category** | $f_{\text{cat}}$ | **5%** | $100$ if caste/minority criteria matched; $50$ if open to General category. |
| **7** | **Residence Area** | $f_{\text{res}}$ | **5%** | $100$ if Rural/Urban priority matches; $50$ if non-restricted. |

### 5.3 Classification Score Bands
- **Strong Match ($\ge 60$)**: High probability of relevance and demographic eligibility.
- **Moderate Match ($40 - 59$)**: Partial alignment; citizen should review specific eligibility exceptions.
- **Low Match ($< 40$)**: Marginal relevance; provided for informational breadth.

---

## 6. Privacy, Security & Ethical Safeguards

1. **No Personally Identifiable Information (Zero PII)**:
   - Does not store or process 12-digit Aadhaar numbers, PAN cards, voter IDs, bank accounts, or names.
2. **Ephemeral Session Architecture**:
   - Profile calculations are performed dynamically in memory and not written to relational user tables.
3. **No Automated Approvals Guarantee**:
   - The platform strictly enforces disclaimers stating that recommendations are preliminary navigational guidance, eliminating legal and social liability.
4. **Direct Government Handoff**:
   - Every scheme card contains the direct, vetted URL to the government department or *myScheme.gov.in* portal.

---

## 7. Future Technology Roadmap

- **Indic Voice-First Intake (Bhashini API)**: Enabling illiterate and semi-literate rural citizens to state their needs verbally in Hindi, Bengali, Tamil, Telugu, and other 22 official languages.
- **WhatsApp Chatbot Micro-Service**: Delivering scheme discovery directly over WhatsApp via lightweight webhook endpoints.
- **Voluntary DigiLocker OAuth Integration**: Optional one-click verification allowing users to auto-check eligibility against verified certificates without uploading raw PDFs.
