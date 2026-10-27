import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Landmark, Menu, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NAV_LINKS = [
  { to: "/", label: "Home", testid: "header-nav-link-home" },
  { to: "/find-schemes", label: "Find Schemes", testid: "header-nav-link-find" },
  { to: "/schemes", label: "Browse Schemes", testid: "header-nav-link-browse" },
  { to: "/demo-profiles", label: "Demo Profiles", testid: "header-nav-link-demo" },
];

export default function Header() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" data-testid="header-nav-logo" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Landmark className="h-5 w-5" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block font-heading text-lg font-bold tracking-tight text-slate-900">
              Sahayak AI
            </span>
            <span className="block text-xs text-slate-500">Government Welfare Scheme Advisor</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={l.testid}
              aria-current={pathname === l.to ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                pathname === l.to
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/admin"
            data-testid="header-nav-link-admin"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "ml-2 gap-2",
            )}
          >
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Admin
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          data-testid="header-mobile-menu-button"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav aria-label="Mobile" className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`${l.testid}-mobile`}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium",
                pathname === l.to ? "bg-teal-50 text-teal-700" : "text-slate-700 hover:bg-slate-100",
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/admin"
            data-testid="header-nav-link-admin-mobile"
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Admin
          </Link>
        </nav>
      )}
    </header>
  );
}
