import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  TriangleAlert,
  GraduationCap,
  Sprout,
  Users,
  ExternalLink,
  Loader2,
  ListChecks,
  UserRoundSearch,
  FileCheck2,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import type { DatasetMeta, RecommendationResponse } from "@/lib/types";
import { DEMO_PROFILES } from "@/lib/options";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25 },
};

const STEPS = [
  {
    icon: UserRoundSearch,
    title: "1. Describe yourself",
    body: "Answer a short, private profile: your state, age, occupation and the kind of support you need. No Aadhaar, bank details or documents — ever.",
    testid: "how-it-works-step-1",
  },
  {
    icon: ListChecks,
    title: "2. We rank the catalogue",
    body: "A transparent text-matching engine ranks all loaded schemes and shows the score breakdown: needs relevance, state fit, age, income and more.",
    testid: "how-it-works-step-2",
  },
  {
    icon: FileCheck2,
    title: "3. Verify and apply",
    body: "Open the official portal link on every scheme, check eligibility and exclusions yourself, and apply through government channels only.",
    testid: "how-it-works-step-3",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const meta = useQuery({
    queryKey: ["meta"],
    queryFn: () => apiGet<DatasetMeta>("/meta"),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Live match simulator: runs the real engine on a preset persona.
  const [simulatorPersona, setSimulatorPersona] = useState<string | null>(null);
  const simulator = useQuery({
    queryKey: ["hero-simulator", simulatorPersona],
    queryFn: () => {
      const persona = DEMO_PROFILES.find((p) => p.id === simulatorPersona)!;
      return apiPost<RecommendationResponse>("/recommendations", persona.profile);
    },
    enabled: !!simulatorPersona,
    staleTime: 60 * 1000,
  });

  const statsLoaded = meta.isSuccess;
  const statItems = [
    { label: "Schemes in catalogue", value: statsLoaded ? meta.data.total_schemes.toLocaleString("en-IN") : "—", testid: "hero-stat-schemes" },
    { label: "Central schemes", value: statsLoaded ? meta.data.central_schemes.toLocaleString("en-IN") : "—", testid: "hero-stat-central" },
    { label: "States & UTs covered", value: statsLoaded ? String(meta.data.states.length) : "—", testid: "hero-stat-states" },
  ];

  const simPersona = DEMO_PROFILES.find((p) => p.id === simulatorPersona) ?? null;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0B2545] text-white">
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
          <motion.div {...fadeUp} className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/40 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-teal-300">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              Digital public service · hackathon build
            </span>
            <h1 className="mt-5 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Find the government schemes
              <span className="block text-teal-300">you may be eligible for</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              Sahayak AI searches a catalogue of thousands of Indian central and state welfare
              schemes against your profile — and shows its reasoning. Transparent, private, and
              free. Recommendations are preliminary: always verify on the official portal.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/find-schemes" data-testid="hero-cta-find" className={buttonVariants({ size: "lg", className: "gap-2 bg-teal-600 hover:bg-teal-500" })}>
                Find My Schemes
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/schemes" data-testid="hero-cta-browse" className={buttonVariants({ variant: "outline", size: "lg", className: "gap-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" })}>
                <Search className="h-4 w-4" aria-hidden />
                Browse All Schemes
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4" data-testid="hero-stats">
              {statItems.map((s) => (
                <div key={s.label} className="rounded-lg border border-white/10 bg-white/5 p-3" data-testid={s.testid}>
                  <dt className="text-xs text-slate-400">{s.label}</dt>
                  <dd className="mt-1 font-mono text-2xl font-semibold text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          {/* Live match simulator */}
          <motion.div {...fadeUp} className="lg:col-span-5" data-testid="hero-simulator">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <h2 className="font-heading text-lg font-bold">Try a live match preview</h2>
              <p className="mt-1 text-sm text-slate-300">
                Pick an example citizen — the real ranking engine runs on the loaded catalogue.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {DEMO_PROFILES.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    data-testid={`hero-simulator-chip-${p.id}`}
                    onClick={() => setSimulatorPersona(p.id)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors duration-150 ${
                      simulatorPersona === p.id
                        ? "border-teal-400 bg-teal-500/20 text-teal-200"
                        : "border-white/20 text-slate-200 hover:border-teal-400/60 hover:text-teal-200"
                    }`}
                  >
                    {p.id === "student" && <GraduationCap className="h-4 w-4" aria-hidden />}
                    {p.id === "farmer" && <Sprout className="h-4 w-4" aria-hidden />}
                    {p.id === "senior" && <Users className="h-4 w-4" aria-hidden />}
                    {p.name} ({p.age})
                  </button>
                ))}
              </div>

              <div className="mt-5 min-h-[140px] rounded-xl bg-[#081A2E]/70 p-4" data-testid="hero-simulator-result-panel">
                {!simulatorPersona && (
                  <p className="text-sm text-slate-400">Choose a profile above to see the top text matches appear here.</p>
                )}
                {simulator.isFetching && (
                  <p className="flex items-center gap-2 text-sm text-teal-300" data-testid="hero-simulator-loading">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Matching against the catalogue…
                  </p>
                )}
                {simulator.isError && (
                  <p className="text-sm text-amber-300" data-testid="hero-simulator-error">
                    Could not reach the matching service. The full app will retry when you use Find My Schemes.
                  </p>
                )}
                {simulator.data && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-400">
                      Top text matches for {simPersona?.name}&apos;s profile
                    </p>
                    <ul className="mt-2 space-y-2" data-testid="hero-simulator-results">
                      {simulator.data.results.slice(0, 2).map((r) => (
                        <li key={r.scheme.slug} className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2">
                          <span className="min-w-0 truncate text-sm text-white">{r.scheme.name}</span>
                          <Badge className="shrink-0 bg-teal-500 font-mono text-white">{r.score}</Badge>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      data-testid="hero-simulator-full-results"
                      onClick={() => {
                        if (simPersona) {
                          sessionStorage.setItem("sahayak:profile", JSON.stringify(simPersona.profile));
                          sessionStorage.setItem("sahayak:demo", simPersona.name);
                        }
                        navigate("/results");
                      }}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
                    >
                      See full results <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer strip */}
      <section className="border-b border-amber-200 bg-amber-50" data-testid="disclaimer-banner">
        <div className="mx-auto flex max-w-7xl items-start gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <p className="text-sm leading-relaxed text-amber-900">
            <strong>Important:</strong> recommendations are preliminary text-based matches, not
            eligibility decisions. Sahayak AI is not a government website and makes no claim of
            accuracy for real citizens. Verify every scheme on its official portal before acting.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">How Sahayak works</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <motion.div
              key={s.title}
              {...fadeUp}
              data-testid={s.testid}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Demo personas teaser */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-slate-900">Demo mode</h2>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Five illustrative citizen profiles — results are always computed live from the
                loaded catalogue, never hardcoded.
              </p>
            </div>
            <Link to="/demo-profiles" data-testid="home-demo-link" className={buttonVariants({ variant: "outline", className: "gap-2" })}>
              Open demo profiles <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {DEMO_PROFILES.map((p) => (
              <Link
                key={p.id}
                to="/demo-profiles"
                data-testid={`home-demo-card-${p.id}`}
                className="rounded-xl border border-slate-200 p-4 transition-colors duration-150 hover:border-teal-300 hover:bg-teal-50/50"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F766E] font-heading text-sm font-bold text-white">
                  {p.name.charAt(0)}
                </span>
                <p className="mt-3 font-heading text-sm font-bold text-slate-900">
                  {p.name}, {p.age}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500">{p.headline}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Data attribution */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8" data-testid="home-data-attribution">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-slate-900">Where the data comes from</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            The catalogue is a community-maintained snapshot of the{" "}
            <a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline">
              MyScheme.gov.in portal <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>{" "}
            published under the Apache-2.0 licence (dataset version noted 15 Aug 2026). Sahayak AI
            does not invent schemes or eligibility criteria — anything missing in the source data is
            shown as missing. Government information changes frequently; always confirm on the
            official portal.
          </p>
          {meta.isSuccess && (
            <p className="mt-3 text-xs text-slate-400" data-testid="home-data-updated">
              Catalogue loaded: {meta.data.total_schemes.toLocaleString("en-IN")} schemes ·{" "}
              {meta.data.last_imported_at ? `imported ${new Date(meta.data.last_imported_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : "import date unavailable"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
