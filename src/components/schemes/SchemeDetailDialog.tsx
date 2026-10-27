import { useQuery } from "@tanstack/react-query";
import { ExternalLink, TriangleAlert, Info } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { SchemeDetail, ScoreComponent } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "./Skeleton";

function Section({ title, body, testid }: { title: string; body: string | null; testid: string }) {
  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-700">{title}</h4>
      <p data-testid={testid} className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {body ?? <span className="italic text-slate-400">Not available in the source data.</span>}
      </p>
    </section>
  );
}

interface Props {
  slug: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  components?: ScoreComponent[];
}

export function SchemeDetailDialog({ slug, open, onOpenChange, components }: Props) {
  const detail = useQuery({
    queryKey: ["scheme", slug],
    queryFn: () => apiGet<SchemeDetail>(`/schemes/${slug}`),
    enabled: open && !!slug,
    retry: 1,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl" data-testid="scheme-detail-dialog">
        <DialogHeader>
          <DialogTitle data-testid="scheme-detail-name" className="font-heading text-xl font-bold tracking-tight text-slate-900">
            {detail.data?.name ?? "Scheme details"}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            {detail.data && (
              <>
                <Badge variant="outline" className="border-slate-300">
                  {detail.data.level === "Central Government" ? "Central Government" : detail.data.state}
                </Badge>
                {detail.data.category && <Badge variant="secondary">{detail.data.category}</Badge>}
                {detail.data.application_mode && <Badge variant="outline">Apply: {detail.data.application_mode}</Badge>}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {detail.isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        )}

        {detail.isError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" data-testid="scheme-detail-error">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Could not load scheme details ({detail.error instanceof Error ? detail.error.message : "unknown error"}). Close and try again.
            </span>
          </div>
        )}

        {detail.data && (
          <div className="space-y-5">
            {components && components.length > 0 && (
              <section className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ranking breakdown for your profile</h4>
                <ul className="mt-2 space-y-1.5" data-testid="scheme-detail-components">
                  {components.map((c) => (
                    <li key={c.component} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="inline-block shrink-0 rounded bg-teal-50 px-1.5 py-0.5 font-mono font-medium text-teal-800">
                        {c.weight}%
                      </span>
                      <span>
                        <strong className="font-semibold text-slate-700">{c.label}:</strong> {c.score}/100 — {c.note}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Section title="Description" body={detail.data.description} testid="scheme-detail-description" />
            <Section title="Eligibility (general)" body={detail.data.eligibility_general} testid="scheme-detail-eligibility-general" />
            <Section title="Eligibility criteria (full)" body={detail.data.eligibility_criteria} testid="scheme-detail-eligibility-criteria" />
            <Section title="Benefits" body={detail.data.benefits} testid="scheme-detail-benefits" />
            <Section title="Exclusions / ineligibility" body={detail.data.exclusions} testid="scheme-detail-exclusions" />
            <Section title="Documents required" body={detail.data.documents_required} testid="scheme-detail-documents" />
            <Section title="Application process" body={detail.data.application_process} testid="scheme-detail-process" />

            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              {detail.data.official_link ? (
                <a href={detail.data.official_link} target="_blank" rel="noopener noreferrer" data-testid="scheme-detail-official-link">
                  <Button size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Open official portal
                  </Button>
                </a>
              ) : (
                <span className="text-sm text-slate-500">Official link unavailable</span>
              )}
              {detail.data.myscheme_url && (
                <a href={detail.data.myscheme_url} target="_blank" rel="noopener noreferrer" data-testid="scheme-detail-myscheme-link">
                  <Button size="sm" variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    MyScheme page
                  </Button>
                </a>
              )}
            </div>

            <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900" data-testid="scheme-detail-verify-warning">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
              <span>
                All details above come from a community snapshot of the MyScheme portal and may be
                outdated or incomplete. Always verify eligibility and apply through the official
                government portal only.
              </span>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
