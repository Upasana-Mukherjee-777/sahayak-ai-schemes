import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, SearchX, Search, Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { DatasetMeta, PagedSchemes } from "@/lib/types";
import { SchemeSummaryCard } from "@/components/schemes/SchemeCard";
import { Skeleton } from "@/components/schemes/Skeleton";
import { Button } from "@/components/ui/button";
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
const PAGE_SIZE = 12;

export default function Explorer() {
  const [qInput, setQInput] = useState("");
  const [q, setQ] = useState("");
  const [level, setLevel] = useState(UNSPECIFIED);
  const [state, setState] = useState(UNSPECIFIED);
  const [category, setCategory] = useState(UNSPECIFIED);
  const [page, setPage] = useState(1);

  // Debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(qInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [qInput]);

  const meta = useQuery({
    queryKey: ["meta"],
    queryFn: () => apiGet<DatasetMeta>("/meta"),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const schemes = useQuery({
    queryKey: ["schemes", q, level, state, category, page],
    queryFn: () =>
      apiGet<PagedSchemes>(
        `/schemes?q=${encodeURIComponent(q)}` +
          `&level=${level === UNSPECIFIED ? "" : level === "central" ? "central" : "state"}` +
          `&state=${encodeURIComponent(state === UNSPECIFIED ? "" : state)}` +
          `&category=${encodeURIComponent(category === UNSPECIFIED ? "" : category)}` +
          `&page=${page}&page_size=${PAGE_SIZE}`,
      ),
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const items = schemes.data?.items ?? [];
  const total = schemes.data?.total ?? 0;
  const totalPages = schemes.data?.total_pages ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">Browse all schemes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          The full loaded catalogue — search, filter and open any scheme&apos;s official source. No
          statistics about beneficiaries or savings are shown because none exist in the source data.
        </p>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5" data-testid="explorer-filters">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="explorer-search">Search schemes</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              id="explorer-search"
              className="pl-9"
              placeholder="Search by name, tag or description…"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              data-testid="explorer-search-input"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="explorer-level">Government level</Label>
          <Select
            value={level}
            onValueChange={(v: string) => {
              setLevel(v);
              setPage(1);
            }}
          >
            <SelectTrigger id="explorer-level" data-testid="explorer-filter-level-select">
              <SelectValue>{level === UNSPECIFIED ? "Central + state" : level === "central" ? "Central" : "State / UT"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>Central + state</SelectItem>
              <SelectItem value="central">Central only</SelectItem>
              <SelectItem value="state">State / UT only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="explorer-state">State / UT</Label>
          <Select
            value={state}
            onValueChange={(v: string) => {
              setState(v);
              setPage(1);
            }}
          >
            <SelectTrigger id="explorer-state" data-testid="explorer-filter-state-select">
              <SelectValue>{state === UNSPECIFIED ? "All states" : state}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>All states</SelectItem>
              {(meta.data?.states ?? []).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="explorer-category">Category</Label>
          <Select
            value={category}
            onValueChange={(v: string) => {
              setCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger id="explorer-category" data-testid="explorer-filter-category-select">
              <SelectValue>{category === UNSPECIFIED ? "All categories" : category}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSPECIFIED}>All categories</SelectItem>
              {(meta.data?.categories ?? []).map((c) => (
                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Status line */}
      <div className="mt-4 flex items-center justify-between text-sm text-slate-500" data-testid="explorer-status-line">
        <span data-testid="explorer-count">
          {schemes.isFetching ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Searching…
            </span>
          ) : schemes.data ? (
            `${total.toLocaleString("en-IN")} scheme${total === 1 ? "" : "s"} found`
          ) : (
            ""
          )}
        </span>
        {schemes.data && total > 0 && (
          <span data-testid="explorer-page-info" className="font-mono text-xs">
            Page {schemes.data.page} of {schemes.data.total_pages}
          </span>
        )}
      </div>

      {/* Error */}
      {schemes.isError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center" data-testid="explorer-error-state" role="alert">
          <p className="text-sm font-medium text-red-800">
            Could not load the catalogue
            {schemes.error instanceof Error ? ` (${schemes.error.message})` : ""}. The dataset may
            still be importing — try again in a moment.
          </p>
          <Button variant="destructive" className="mt-3" data-testid="explorer-error-retry-button" onClick={() => schemes.refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Loading skeleton */}
      {schemes.isFetching && !schemes.data && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="explorer-loading-skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-5 w-3/4" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      {schemes.data && items.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="explorer-grid">
          {items.map((s) => (
            <SchemeSummaryCard key={s.slug} scheme={s} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {schemes.data && items.length === 0 && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-12 text-center" data-testid="explorer-empty-state">
          <SearchX className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
          <h2 className="mt-3 font-heading text-lg font-bold text-slate-900">No schemes found</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">
            Nothing in the catalogue matches this search. Try a shorter keyword or clear the
            filters.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            data-testid="explorer-empty-reset-button"
            onClick={() => {
              setQInput("");
              setLevel(UNSPECIFIED);
              setState(UNSPECIFIED);
              setCategory(UNSPECIFIED);
              setPage(1);
            }}
          >
            Clear search &amp; filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {schemes.data && totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination" data-testid="explorer-pagination">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={page <= 1}
            data-testid="explorer-pagination-prev"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden /> Previous
          </Button>
          <span className="font-mono text-sm text-slate-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={page >= totalPages}
            data-testid="explorer-pagination-next"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
        </nav>
      )}
    </div>
  );
}
