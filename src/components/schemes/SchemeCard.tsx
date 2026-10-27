import { ExternalLink, FileText, TriangleAlert, CheckCircle2 } from "lucide-react";
import type { RankedScheme, SchemeSummary, ScoreBand } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SchemeDetailDialog } from "./SchemeDetailDialog";
import { useState } from "react";

const BAND_STYLES: Record<ScoreBand, { badge: string; bar: string; label: string }> = {
  strong: { badge: "bg-green-100 text-green-800", bar: "bg-green-500", label: "Strong text match" },
  moderate: { badge: "bg-amber-100 text-amber-800", bar: "bg-amber-500", label: "Moderate text match" },
  low: { badge: "bg-slate-100 text-slate-700", bar: "bg-slate-400", label: "Low text match" },
};

interface Props {
  ranked: RankedScheme;
  rank: number;
}

export function SchemeCard({ ranked, rank }: Props) {
  const { scheme, score, score_band, why_matched, flags, components } = ranked;
  const [detailOpen, setDetailOpen] = useState(false);
  const band = BAND_STYLES[score_band] ?? BAND_STYLES.low;
  const isCentral = scheme.level === "Central Government";

  return (
    <article
      data-testid={`results-card-${scheme.slug}`}
      className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
              {rank}
            </span>
            <Badge variant="outline" className={cn("border-slate-300", isCentral ? "border-blue-200 bg-blue-50 text-blue-800" : "border-teal-200 bg-teal-50 text-teal-800")}>
              {isCentral ? "Central Government" : scheme.state}
            </Badge>
            {scheme.category && (
              <Badge variant="secondary" data-testid={`results-card-category-${scheme.slug}`}>
                {scheme.category}
              </Badge>
            )}
          </div>
          <h3 className="mt-2 font-heading text-lg font-bold leading-snug tracking-tight text-slate-900">
            {scheme.name}
          </h3>
          <p className="clamp-3 mt-1 text-sm leading-relaxed text-slate-600">{scheme.description}</p>
        </div>

        {/* Ranking score — clearly a ranking score, not an eligibility probability */}
        <div data-testid={`results-card-score-${scheme.slug}`} className="w-full max-w-[180px] shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-2xl font-semibold text-slate-900">{score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className={cn("h-full rounded-full", band.bar)} style={{ width: `${score}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] leading-tight text-slate-500">
            Ranking score — {band.label}. Not an eligibility probability.
          </p>
        </div>
      </div>

      {why_matched.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-700">Why it may be relevant</h4>
          <ul className="mt-2 space-y-1">
            {why_matched.slice(0, 3).map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" aria-hidden />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {scheme.benefits && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Benefits (from source data)</h4>
          <p className="clamp-2 mt-1 text-sm leading-relaxed text-slate-700">{scheme.benefits}</p>
        </div>
      )}

      {flags.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-3" data-testid={`results-card-flags-${scheme.slug}`}>
          {flags.slice(0, 2).map((flag, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-amber-900">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
              <span>{flag}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Button variant="secondary" size="sm" data-testid={`results-card-details-${scheme.slug}`} onClick={() => setDetailOpen(true)}>
          <FileText className="h-4 w-4" aria-hidden />
          View details
        </Button>
        {scheme.official_link ? (
          <a
            href={scheme.official_link}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`results-card-link-${scheme.slug}`}
          >
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" aria-hidden />
              Official page
            </Button>
          </a>
        ) : (
          <span className="text-xs text-slate-500">Official link unavailable</span>
        )}
        {scheme.documents_required && (
          <span className="ml-auto text-xs text-slate-400">Documents listed in source data</span>
        )}
      </div>

      <SchemeDetailDialog
        slug={scheme.slug}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        components={components}
      />
    </article>
  );
}

export function SchemeSummaryCard({ scheme }: { scheme: SchemeSummary }) {
  const [detailOpen, setDetailOpen] = useState(false);
  const isCentral = scheme.level === "Central Government";
  return (
    <article
      data-testid={`explorer-card-${scheme.slug}`}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-shadow duration-200 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn(isCentral ? "border-blue-200 bg-blue-50 text-blue-800" : "border-teal-200 bg-teal-50 text-teal-800")}>
          {isCentral ? "Central" : scheme.state}
        </Badge>
        {scheme.category && <Badge variant="secondary">{scheme.category}</Badge>}
        {scheme.application_mode && (
          <span className="text-xs text-slate-400">Apply: {scheme.application_mode}</span>
        )}
      </div>
      <h3 className="font-heading text-base font-bold leading-snug tracking-tight text-slate-900">{scheme.name}</h3>
      <p className="clamp-3 text-sm leading-relaxed text-slate-600">{scheme.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <Button variant="secondary" size="xs" data-testid={`explorer-card-details-${scheme.slug}`} onClick={() => setDetailOpen(true)}>
          View details
        </Button>
        {scheme.official_link ? (
          <a href={scheme.official_link} target="_blank" rel="noopener noreferrer" data-testid={`explorer-card-link-${scheme.slug}`}>
            <Button variant="ghost" size="xs" className="gap-1">
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              Source
            </Button>
          </a>
        ) : (
          <span className="text-xs text-slate-400">Official link unavailable</span>
        )}
      </div>
      <SchemeDetailDialog slug={scheme.slug} open={detailOpen} onOpenChange={setDetailOpen} />
    </article>
  );
}
