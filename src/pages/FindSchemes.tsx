import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { CitizenProfileForm } from "@/components/schemes/CitizenProfileForm";
import { Button } from "@/components/ui/button";
import { saveProfile, loadProfile } from "@/lib/options";
import { Link } from "react-router-dom";

export default function FindSchemes() {
  const navigate = useNavigate();
  const existing = loadProfile();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to="/"
          data-testid="find-back-link"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to home
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-slate-900">
          {existing ? "Edit your profile" : "Tell us about yourself"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Answer only what you are comfortable sharing. Every field except your state, age and the
          support you need is optional — each one you add sharpens the ranking. Your answers are
          used to match scheme text and are never sent to a server for storage.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <CitizenProfileForm
          initial={existing}
          submitLabel={existing ? "Update & rerun recommendations" : "Find My Schemes"}
          onValid={(profile) => {
            // Editing clears the demo marker: this is now the visitor's own profile.
            saveProfile(profile, null);
            toast.success("Profile saved in this browser tab — computing recommendations.");
            navigate("/results");
          }}
        />
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        Want to try without entering your own details?{" "}
        <Link to="/demo-profiles" data-testid="find-demo-link" className="font-semibold text-teal-700 hover:underline">
          Use a demo profile
        </Link>
        .
      </p>
    </div>
  );
}
