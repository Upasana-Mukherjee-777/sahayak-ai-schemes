import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { CitizenProfile, DatasetMeta } from "@/lib/types";
import {
  DISABILITY_TYPES,
  EDUCATION_LEVELS,
  GENDERS,
  INCOME_RANGES,
  OCCUPATIONS,
  RESIDENCE_TYPES,
  SOCIAL_CATEGORIES,
  SUPPORT_TYPES,
  supportTypeToSlug,
} from "@/lib/options";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNSPECIFIED = "unspecified";

interface Props {
  initial?: CitizenProfile | null;
  submitLabel?: string;
  onValid: (profile: CitizenProfile) => void;
}

type FormState = {
  state: string;
  age: string;
  gender: string;
  education: string;
  occupation: string;
  income: string;
  residence: string;
  category: string;
  hasDisability: boolean;
  disabilityType: string;
  supportTypes: string[];
};

function toFormState(initial?: CitizenProfile | null): FormState {
  return {
    state: initial?.state ?? UNSPECIFIED,
    age: initial ? String(initial.age) : "",
    gender: initial?.gender ?? UNSPECIFIED,
    education: initial?.education ?? UNSPECIFIED,
    occupation: initial?.occupation ?? UNSPECIFIED,
    income: initial?.income_range ?? UNSPECIFIED,
    residence: initial?.residence ?? UNSPECIFIED,
    category: initial?.social_category ?? UNSPECIFIED,
    hasDisability: initial?.has_disability ?? false,
    disabilityType: initial?.disability_type ?? UNSPECIFIED,
    supportTypes: initial?.support_types ?? [],
  };
}

// base-ui SelectValue renders the RAW value — map sentinel/labels through this.
function optionalLabel(v: string | undefined, placeholder: string): string {
  if (!v || v === UNSPECIFIED) return placeholder;
  return v;
}

export function CitizenProfileForm({ initial, submitLabel = "Find My Schemes", onValid }: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const meta = useQuery({
    queryKey: ["meta"],
    queryFn: () => apiGet<DatasetMeta>("/meta"),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const states = useMemo(() => meta.data?.states ?? [], [meta.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleSupport = (label: string, checked: boolean) =>
    setForm((f) => ({
      ...f,
      supportTypes: checked
        ? f.supportTypes.length >= 8
          ? f.supportTypes
          : [...f.supportTypes, label]
        : f.supportTypes.filter((s) => s !== label),
    }));

  function validate(): CitizenProfile | null {
    const next: Record<string, string> = {};
    if (form.state === UNSPECIFIED || !form.state) next.state = "Please select your state or union territory.";
    const age = Number(form.age);
    if (!form.age.trim()) next.age = "Please enter your age.";
    else if (!Number.isInteger(age) || age < 1 || age > 120) next.age = "Age must be a whole number between 1 and 120.";
    if (form.supportTypes.length === 0) next.supportTypes = "Choose at least one type of support you are looking for.";
    setErrors(next);
    return Object.keys(next).length === 0
      ? {
          state: form.state,
          age: age,
          gender: form.gender === UNSPECIFIED ? null : form.gender,
          education: form.education === UNSPECIFIED ? null : form.education,
          occupation: form.occupation === UNSPECIFIED ? null : form.occupation,
          income_range: form.income === UNSPECIFIED ? null : form.income,
          residence: form.residence === UNSPECIFIED ? null : form.residence,
          social_category: form.category === UNSPECIFIED ? null : form.category,
          has_disability: form.hasDisability,
          disability_type: form.hasDisability && form.disabilityType !== UNSPECIFIED ? form.disabilityType : null,
          support_types: form.supportTypes,
        }
      : null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const profile = validate();
    if (!profile) {
      toast.error("Please fix the highlighted fields before continuing.");
      return;
    }
    onValid(profile);
  }

  function handleReset() {
    setForm(toFormState(null));
    setErrors({});
  }

  const err = (key: string, testid: string) =>
    errors[key] ? (
      <p role="alert" data-testid={testid} className="mt-1.5 text-xs font-medium text-red-600">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="citizen-profile-form" className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* State / UT */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-state">State or Union Territory *</Label>
          <Select value={form.state} onValueChange={(v: string) => set("state", v)}>
            <SelectTrigger id="profile-state" data-testid="profile-state-select" aria-label="State or Union Territory">
              <SelectValue>{optionalLabel(form.state, meta.isLoading ? "Loading states…" : "Select your state / UT")}</SelectValue>
            </SelectTrigger>
            <SelectContent data-testid="profile-state-options">
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {meta.isError && (
            <p role="alert" className="text-xs text-red-600">
              Could not load the state list ({meta.error instanceof Error ? meta.error.message : "error"}). Check your connection and reload.
            </p>
          )}
          {err("state", "profile-state-error")}
        </div>

        {/* Age */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-age">Age *</Label>
          <Input
            id="profile-age"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            placeholder="e.g. 24"
            value={form.age}
            onChange={(e) => set("age", e.target.value)}
            data-testid="profile-age-input"
          />
          {err("age", "profile-age-error")}
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-gender">Gender (optional)</Label>
          <Select value={form.gender} onValueChange={(v: string) => set("gender", v)}>
            <SelectTrigger id="profile-gender" data-testid="profile-gender-select">
              <SelectValue>{optionalLabel(form.gender, "Any / Prefer not to say")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>Any / Prefer not to say</SelectItem>
              {GENDERS.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Education */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-education">Education level (optional)</Label>
          <Select value={form.education} onValueChange={(v: string) => set("education", v)}>
            <SelectTrigger id="profile-education" data-testid="profile-education-select">
              <SelectValue>{optionalLabel(form.education, "Any / Not specified")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>Any / Not specified</SelectItem>
              {EDUCATION_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Occupation */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-occupation">Occupation / beneficiary group (optional)</Label>
          <Select value={form.occupation} onValueChange={(v: string) => set("occupation", v)}>
            <SelectTrigger id="profile-occupation" data-testid="profile-occupation-select">
              <SelectValue>{optionalLabel(form.occupation, "Any / Not specified")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>Any / Not specified</SelectItem>
              {OCCUPATIONS.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Income */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-income">Annual household income (optional)</Label>
          <Select value={form.income} onValueChange={(v: string) => set("income", v)}>
            <SelectTrigger id="profile-income" data-testid="profile-income-select">
              <SelectValue>{optionalLabel(form.income, "Any / Prefer not to say")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>Any / Prefer not to say</SelectItem>
              {INCOME_RANGES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Residence */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-residence">Residence (optional)</Label>
          <Select value={form.residence} onValueChange={(v: string) => set("residence", v)}>
            <SelectTrigger id="profile-residence" data-testid="profile-residence-select">
              <SelectValue>{optionalLabel(form.residence, "Any / Not specified")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>Any / Not specified</SelectItem>
              {RESIDENCE_TYPES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Social category */}
        <div className="space-y-1.5">
          <Label htmlFor="profile-category">Social category (optional)</Label>
          <Select value={form.category} onValueChange={(v: string) => set("category", v)}>
            <SelectTrigger id="profile-category" data-testid="profile-category-select">
              <SelectValue>{optionalLabel(form.category, "Any / Not specified")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>Any / Not specified</SelectItem>
              {SOCIAL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Disability */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <Checkbox
            id="profile-disability"
            checked={form.hasDisability}
            onCheckedChange={(c) => set("hasDisability", Boolean(c))}
            data-testid="profile-disability-checkbox"
          />
          <span className="text-sm font-medium text-slate-700">
            I am a person with a disability (optional — improves disability-welfare matching)
          </span>
        </label>
        {form.hasDisability && (
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="profile-disability-type">Type of disability (optional)</Label>
            <Select value={form.disabilityType} onValueChange={(v: string) => set("disabilityType", v)}>
              <SelectTrigger id="profile-disability-type" data-testid="profile-disability-type-select">
                <SelectValue>{optionalLabel(form.disabilityType, "Select type (optional)")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UNSPECIFIED}>Prefer not to specify</SelectItem>
                {DISABILITY_TYPES.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Support types */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">
          What kind of support are you looking for? <span className="font-normal text-slate-500">(select up to 8)</span> *
        </legend>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="profile-support-grid">
          {SUPPORT_TYPES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 transition-colors duration-150 hover:border-teal-300 has-[[data-checked]]:border-teal-500 has-[[data-checked]]:bg-teal-50">
              <Checkbox
                checked={form.supportTypes.includes(type)}
                onCheckedChange={(c) => toggleSupport(type, Boolean(c))}
                data-testid={`profile-support-${supportTypeToSlug(type)}-checkbox`}
              />
              <span>{type}</span>
            </label>
          ))}
        </div>
        {err("supportTypes", "profile-support-error")}
      </fieldset>

      {/* Privacy notice + actions */}
      <div className="flex flex-col gap-4 rounded-lg border border-teal-200 bg-teal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-teal-900" data-testid="profile-privacy-note">
          <strong className="font-semibold">Privacy:</strong> we never ask for Aadhaar, bank
          details, exact address or documents, and your answers are not stored on our servers —
          they stay in this browser tab.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="ghost" onClick={handleReset} data-testid="profile-form-reset-button">
            Clear
          </Button>
          <Button type="submit" data-testid="profile-form-submit-button" className="gap-2">
            {meta.isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
