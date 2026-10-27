import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Home from "@/pages/Home";
import FindSchemes from "@/pages/FindSchemes";
import Results from "@/pages/Results";
import Explorer from "@/pages/Explorer";
import DemoProfiles from "@/pages/DemoProfiles";
import Admin from "@/pages/Admin";

function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">404</p>
      <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
        This page does not exist
      </h1>
      <p className="max-w-md text-slate-600">
        The link may be outdated. Head back to the home page to find government welfare schemes.
      </p>
      <Link
        to="/"
        data-testid="notfound-home-link"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Go home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/find-schemes" element={<FindSchemes />} />
          <Route path="/results" element={<Results />} />
          <Route path="/schemes" element={<Explorer />} />
          <Route path="/demo-profiles" element={<DemoProfiles />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      {/* Toaster mounts once; toast() calls come from anywhere */}
      <Toaster />
    </div>
  );
}
