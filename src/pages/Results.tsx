import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  TriangleAlert,
  RefreshCw,
  SearchX,
  ServerCrash,
  Info,
} from "lucide-react";
import { apiPost } from "@/lib/api";
import type { RecommendationResponse, CitizenProfile } from "@/lib/types";
import { loadProfile, getDemoName } from "@/lib/options";
import { SchemeCard } from "@/components/schemes/SchemeCard";
import { Skeleton } from "@/components/schemes/Skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNSPECIFIED = "all";

export default function Results() {
  const profile = loadProfile();
  const demoName = getDemoName();
  const [levelFilter, setLevelFilter] = useState(UNSPECIFIED);
  const [categoryFilter, setCategoryFilter] = useState(UNSPECIFIED);
  const [stateFilter, setStateFilter] = useState(UNSPECIFIED);
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("match");

  const recs = useQuery({
    queryKey: ["recommendations", profile ? JSON.stringify(profile) : null],
    queryFn: () => apiPost<RecommendationResponse>("/recommendations", profile as CitizenProfile),
    enabled: !!profile,
    retry: 1,
    staleTime: 60 * 1000,
  });

  const results = useMemo(() => recs.data?.results ?? [], [recs.data]);

  const availableCategories = useMemo(
    () => Array.from(new Set(results.map((r) => r.scheme.category).filter(Boolean) as string[])).sort(),
    [results],
  );
  const availableStates = useMemo(
    () => Array.from(new Set(results.map((r) => r.scheme.state))).sort(),
    [results],
  );

  const visible = useMemo(() => {
    let list = [...results];
    if (levelFilter !== UNSPECIFIED) list = list.filter((r) => r.scheme.level === levelFilter);
    if (stateFilter !== UNSPECIFIED) list = list.filter((r) => r.scheme.state === stateFilter);
    if (categoryFilter !== UNSPECIFIED)
      list = list.filter((r) => r.scheme.tags.some((t) => t.toLowerCase() === categoryFilter.toLowerCase()));
    const kw = keyword.trim().toLowerCase();
    if (kw)
      list = list.filter(
        (r) =>
          r.scheme.name.toLowerCase().includes(kw) ||
          r.scheme.description?.toLowerCase().includes(kw) ||
          r.scheme.tags.some((t) => t.toLowerCase().includes(kw)),
      );
    if (sort === "name") list.sort((a, b) => a.scheme.name.localeCompare(b.scheme.name));
    else list.sort((a, b) => b.score - a.score || a.scheme.name.localeCompare(b.scheme.name));
    return list;
  }, [results, levelFilter, stateFilter, categoryFilter, keyword, sort]);

  // No profile yet — an onboarding state, not an error.
  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center" data-testid="results-no-profile-state">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">No profile yet</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          Tell us a little about yourself and we will rank the welfare catalogue for you. It takes
          about two minutes and nothing is stored on our servers.
        </p>
        <Link to="/find-schemes" data-testid="results-no-profile-cta" className="mt-6 inline-block">
          <Button size="lg">Build my profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Profile summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5" data-testid="results-profile-bar">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900">
              {demoName ? (
                <span data-testid="results-demo-banner">
                  Demo results for <em className="text-teal-700 not-italic">{demoName}</em> (example profile)
                </span>
              ) : (
                "Your recommendations"
              )}
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {profile.state} · age {profile.age}
            {profile.occupation ? ` · ${profile.occupation}` : ""}
            {profile.has_disability ? " · person with disability" : ""} · needs:{" "}
            {profile.support_types.join(", ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/find-schemes" data-testid="results-edit-profile-button">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Modify profile
            </Button>
          </Link>
          <Button variant="secondary" className="gap-2" data-testid="results-rerun-button" onClick={() => recs.refetch()}>
            <RefreshCw className="h-4 w-4" aria-hidden /> Rerun
          </Button>
        </div>
      </div>

      {/* Loading */}
      {recs.isLoading && (
        <div className="mt-8 space-y-4" data-testid="results-loading-skeleton" aria-live="polite" aria-label="Loading recommendations">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-20 w-40" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error (recoverable) */}
      {recs.isError && (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-center" data-testid="results-error-state" role="alert">
          <ServerCrash className="mx-auto h-8 w-8 text-red-500" aria-hidden />
          <h2 className="mt-3 font-heading text-lg font-bold text-red-900">
            Could not compute recommendations
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-red-700">
            The matching service did not respond
            {recs.error instanceof Error ? ` (${recs.error.message})` : ""}. Your profile is safe in
            this tab — try again.
          </p>
          <Button variant="destructive" className="mt-4 gap-2" data-testid="results-error-retry-button" onClick={() => recs.refetch()}>
            <RefreshCw className="h-4 w-4" aria-hidden /> Retry
          </Button>
        </div>
      )}

      {/* Results */}
      {recs.data && (
        <>
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3" data-testid="results-disclaimer">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
            <p className="text-xs leading-relaxed text-amber-900">{recs.data.disclaimer}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500" data-testid="results-meta-line">
            <Info className="h-3.5 w-3.5" aria-hidden />
            <span>
              Ranked from {recs.data.total_schemes_searched.toLocaleString("en-IN")} loaded schemes ·{" "}
              {recs.data.excluded_other_state.toLocaleString("en-IN")} schemes from other states
              excluded · showing top {results.length}
            </span>
          </div>

          {/* Filters + sort */}
          <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" data-testid="results-filters">
            <div className="space-y-1">
              <Label htmlFor="results-filter-state">State</Label>
              <Select value={stateFilter} onValueChange={setLevelFilterStateSafe(setStateFilter)}>
                <SelectTrigger id="results-filter-state" data-testid="results-filter-state-select">
                  <SelectValue>{stateFilter === UNSPECIFIED ? "All shown states" : stateFilter}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSPECIFIED}>All shown states</SelectItem>
                  {availableStates.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="results-filter-level">Government level</Label>
              <Select value={levelFilter} onValueChange={setLevelFilterStateSafe(setLevelFilter)}>
                <SelectTrigger id="results-filter-level" data-testid="results-filter-level-select">
                  <SelectValue>{levelFilter === UNSPECIFIED ? "Central + state" : levelFilter === "Central Government" ? "Central" : "State / UT"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSPECIFIED}>Central + state</SelectItem>
                  <SelectItem value="Central Government">Central only</SelectItem>
                  <SelectItem value="State / UT Government">State / UT only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="results-filter-category">Category</Label>
              <Select value={categoryFilter} onValueChange={setLevelFilterStateSafe(setCategoryFilter)}>
                <SelectTrigger id="results-filter-category" data-testid="results-filter-category-select">
                  <SelectValue>{categoryFilter === UNSPECIFIED ? "All categories" : categoryFilter}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSPECIFIED}>All categories</SelectItem>
                  {availableCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="results-filter-keyword">Keyword</Label>
              <Input
                id="results-filter-keyword"
                placeholder="e.g. scholarship"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                data-testid="results-filter-keyword-input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="results-sort">Sort by</Label>
              <Select value={sort} onValueChange={setLevelFilterStateSafe(setSort)}>
                <SelectTrigger id="results-sort" data-testid="results-sort-select">
                  <SelectValue>{sort === "match" ? "Highest match first" : "Name (A–Z)"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="match">Highest match first</SelectItem>
                  <SelectItem value="name">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List */}
          {visible.length === 0 ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-12 text-center" data-testid="results-empty-state">
              <SearchX className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
              <h2 className="mt-3 font-heading text-lg font-bold text-slate-900">No schemes match these filters</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
                Try clearing the keyword or category filters, or broaden the support types in your
                profile.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  data-testid="results-empty-reset-filters-button"
                  onClick={() => {
                    setLevelFilter(UNSPECIFIED);
                    setStateFilter(UNSPECIFIED);
                    setCategoryFilter(UNSPECIFIED);
                    setKeyword("");
                  }}
                >
                  Reset filters
                </Button>
                <Link to="/find-schemes">
                  <Button variant="secondary">Edit profile</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4" data-testid="results-list">
              {visible.map((r, i) => (
                <SchemeCard key={r.scheme.slug} ranked={r} rank={i + 1} />
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-center text-xs text-slate-400" data-testid="results-score-note">
            <Badge variant="outline">Ranking scores are text-similarity based — they are not eligibility probabilities.</Badge>
          </div>
        </>
      )}
    </div>
  );
}

// Select's onValueChange hands a string — small helper keeps handlers typed.
function setLevelFilterStateSafe(setter: (v: string) => void) {
  return (v: string) => setter(v);
}
