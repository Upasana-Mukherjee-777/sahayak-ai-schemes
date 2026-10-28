import type { CitizenProfile } from "./types";

// Option labels here MUST lowercase to the keyword-dict keys in
// backend/lib/recommender.py — the engine matches on .lower() of these strings.
export const SUPPORT_TYPES = [
  "Education & Scholarships",
  "Livelihood & Employment",
  "Agriculture & Farmers",
  "Healthcare & Insurance",
  "Housing",
  "Pension & Social Security",
  "Entrepreneurship & Business Loans",
  "Skill Development & Training",
  "Financial Assistance & Compensation",
  "Women & Child Welfare",
  "Food & Nutrition",
  "Water, Sanitation & Electricity",
  "Disability Welfare & Rehabilitation",
  "Senior Citizen Care",
  "Sports & Culture",
  "Marriage & Family Support",
] as const;

export const OCCUPATIONS = [
  "Student",
  "Farmer",
  "Agricultural Labourer",
  "Daily Wage / Unorganised Worker",
  "Unemployed",
  "Self-Employed / Small Business",
  "Salaried - Private Sector",
  "Salaried - Government",
  "Homemaker",
  "Artisan / Weaver / Handicraft Worker",
  "Fisherfolk",
  "Street Vendor / Small Trader",
  "Senior Citizen / Retired",
  "Person with Disability",
  "Health Worker / ASHA / Anganwadi",
] as const;

export const EDUCATION_LEVELS = [
  "No Formal Education",
  "Below Primary",
  "Primary (Class 1-5)",
  "Secondary (Class 10)",
  "Senior Secondary (Class 12)",
  "Diploma / ITI / Vocational",
  "Graduate",
  "Postgraduate & Above",
] as const;

export const INCOME_RANGES = [
  "Below Rs. 50,000",
  "Rs. 50,000 - 1,00,000",
  "Rs. 1,00,000 - 2,50,000",
  "Rs. 2,50,000 - 5,00,000",
  "Rs. 5,00,000 - 10,00,000",
  "Above Rs. 10,00,000",
] as const;

export const GENDERS = ["Female", "Male", "Other"] as const;

export const SOCIAL_CATEGORIES = ["General", "SC", "ST", "OBC", "EBC", "Minority"] as const;

export const RESIDENCE_TYPES = ["Rural", "Urban"] as const;

export const DISABILITY_TYPES = [
  "Locomotor Disability",
  "Visual Impairment",
  "Hearing Impairment",
  "Speech & Language",
  "Intellectual Disability",
  "Multiple Disabilities",
  "Other",
] as const;

export function supportTypeToSlug(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------- session state

const PROFILE_KEY = "sahayak:profile";
const DEMO_KEY = "sahayak:demo";

export function saveProfile(profile: CitizenProfile, demoName: string | null = null): void {
  sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  if (demoName) sessionStorage.setItem(DEMO_KEY, demoName);
  else sessionStorage.removeItem(DEMO_KEY);
}

export function loadProfile(): CitizenProfile | null {
  try {
    const raw = sessionStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CitizenProfile;
    if (typeof parsed.state !== "string" || typeof parsed.age !== "number" || !Array.isArray(parsed.support_types)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getDemoName(): string | null {
  return sessionStorage.getItem(DEMO_KEY);
}

// ---------------------------------------------------------------- demo mode

export interface DemoPersona {
  id: string;
  name: string;
  age: number;
  headline: string;
  description: string;
  profile: CitizenProfile;
}

// Example profiles are illustrative, not real people. Results are always
// computed live from the loaded catalogue — never hardcoded.
export const DEMO_PROFILES: DemoPersona[] = [
  {
    id: "student",
    name: "Sunita",
    age: 19,
    headline: "College student from rural Bihar",
    description:
      "A 19-year-old OBC student who finished Class 12 and is looking for scholarships and skill training to continue her education.",
    profile: {
      state: "Bihar",
      age: 19,
      gender: "Female",
      education: "Senior Secondary (Class 12)",
      occupation: "Student",
      income_range: "Rs. 50,000 - 1,00,000",
      residence: "Rural",
      social_category: "OBC",
      has_disability: false,
      disability_type: null,
      support_types: ["Education & Scholarships", "Skill Development & Training"],
    },
  },
  {
    id: "farmer",
    name: "Ramesh",
    age: 46,
    headline: "Small farmer from rural Madhya Pradesh",
    description:
      "A 46-year-old smallholder farmer who needs crop support, irrigation subsidies and livelihood protection for his family.",
    profile: {
      state: "Madhya Pradesh",
      age: 46,
      gender: "Male",
      education: "Primary (Class 1-5)",
      occupation: "Farmer",
      income_range: "Rs. 1,00,000 - 2,50,000",
      residence: "Rural",
      social_category: "General",
      has_disability: false,
      disability_type: null,
      support_types: ["Agriculture & Farmers", "Livelihood & Employment"],
    },
  },
  {
    id: "senior",
    name: "Savitri Bai",
    age: 68,
    headline: "Senior citizen from urban Rajasthan",
    description:
      "A 68-year-old widow living on a low income who needs old-age pension support and affordable healthcare.",
    profile: {
      state: "Rajasthan",
      age: 68,
      gender: "Female",
      education: "No Formal Education",
      occupation: "Senior Citizen / Retired",
      income_range: "Below Rs. 50,000",
      residence: "Urban",
      social_category: "General",
      has_disability: false,
      disability_type: null,
      support_types: ["Pension & Social Security", "Healthcare & Insurance"],
    },
  },
  {
    id: "entrepreneur",
    name: "Priyanka",
    age: 28,
    headline: "Woman entrepreneur from urban Maharashtra",
    description:
      "A 28-year-old graduate running a small tailoring unit in Pune who wants a business loan and entrepreneurship support to expand.",
    profile: {
      state: "Maharashtra",
      age: 28,
      gender: "Female",
      education: "Graduate",
      occupation: "Self-Employed / Small Business",
      income_range: "Rs. 2,50,000 - 5,00,000",
      residence: "Urban",
      social_category: "General",
      has_disability: false,
      disability_type: null,
      support_types: ["Entrepreneurship & Business Loans", "Women & Child Welfare"],
    },
  },
  {
    id: "disability",
    name: "Rajesh",
    age: 32,
    headline: "Employed professional with locomotor disability, Karnataka",
    description:
      "A 32-year-old salaried professional with a locomotor disability looking for assistive devices, accessibility benefits and livelihood schemes.",
    profile: {
      state: "Karnataka",
      age: 32,
      gender: "Male",
      education: "Graduate",
      occupation: "Person with Disability",
      income_range: "Rs. 2,50,000 - 5,00,000",
      residence: "Urban",
      social_category: "General",
      has_disability: true,
      disability_type: "Locomotor Disability",
      support_types: ["Disability Welfare & Rehabilitation", "Livelihood & Employment"],
    },
  },
];
