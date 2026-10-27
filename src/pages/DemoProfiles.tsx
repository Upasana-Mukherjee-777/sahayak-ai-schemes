import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Play, Pencil, FlaskConical } from "lucide-react";
import { DEMO_PROFILES, saveProfile } from "@/lib/options";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DemoProfiles() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4" data-testid="demo-mode-banner">
        <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" aria-hidden />
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight text-slate-900">Demonstration mode</h1>
          <p className="mt-1 text-sm leading-relaxed text-teal-900">
            The five profiles below are <strong>illustrative examples, not real people</strong>.
            Choosing one runs the live ranking engine on the loaded catalogue — nothing about the
            results is hardcoded. You can edit any example into your own profile.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="demo-profiles-grid">
        {DEMO_PROFILES.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            data-testid={`demo-card-${p.id}`}
            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-shadow duration-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0F766E] font-heading text-lg font-bold text-white">
                {p.name.charAt(0)}
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold tracking-tight text-slate-900">
                  {p.name}, {p.age}
                </h2>
                <p className="text-xs text-slate-500">{p.headline}</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">{p.description}</p>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="outline" className="border-slate-300 text-slate-600">{p.profile.state}</Badge>
              {p.profile.support_types.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
              {p.profile.has_disability && <Badge variant="secondary">{p.profile.disability_type}</Badge>}
            </div>

            <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-4">
              <Button
                size="sm"
                className="gap-2"
                data-testid={`demo-run-${p.id}`}
                onClick={() => {
                  saveProfile(p.profile, p.name);
                  navigate("/results");
                }}
              >
                <Play className="h-4 w-4" aria-hidden /> Run this profile
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                data-testid={`demo-edit-${p.id}`}
                onClick={() => {
                  saveProfile(p.profile, null);
                  navigate("/find-schemes");
                }}
              >
                <Pencil className="h-4 w-4" aria-hidden /> Edit in form
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
