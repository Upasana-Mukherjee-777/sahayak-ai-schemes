import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LogOut,
  Upload,
  RefreshCw,
  Database,
  ShieldCheck,
  TriangleAlert,
  Loader2,
} from "lucide-react";
import { apiGet, apiPost, apiUpload } from "@/lib/api";
import type { AdminSession, DatasetReport, ImportReport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function LoginView() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: () => apiPost<AdminSession>("/admin/login", { username, password }),
    onSuccess: (data) => {
      toast.success(`Signed in as ${data.username}`);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Login failed");
    },
  });

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-2xl border border-slate-200 bg-white p-8" data-testid="admin-login-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ShieldCheck className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-center font-heading text-2xl font-bold tracking-tight text-slate-900">
          Admin sign-in
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Protected area for dataset management. Credentials are configured on the server; sessions
          are httpOnly cookies.
        </p>
        <form
          className="mt-6 space-y-4"
          data-testid="admin-login-form"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="admin-username">Username</Label>
            <Input
              id="admin-username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              data-testid="admin-login-username-input"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="admin-login-password-input"
              required
            />
          </div>
          {login.isError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800" data-testid="admin-login-error">
              {login.error instanceof Error ? login.error.message : "Login failed"}
            </p>
          )}
          <Button type="submit" className="w-full gap-2" disabled={login.isPending} data-testid="admin-login-submit-button">
            {login.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

function DashboardView({ username }: { username: string }) {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<ImportReport | null>(null);

  const dataset = useQuery({
    queryKey: ["admin", "dataset"],
    queryFn: () => apiGet<DatasetReport>("/admin/dataset"),
    retry: 1,
  });

  const logout = useMutation({
    mutationFn: () => apiPost("/admin/logout"),
    onSettled: () => {
      queryClient.clear();
      window.location.assign("/admin");
    },
  });

  const upload = useMutation({
    mutationFn: () => {
      const file = fileInput.current?.files?.[0];
      if (!file) throw new Error("Choose a CSV file first");
      const fd = new FormData();
      fd.append("file", file);
      return apiUpload<ImportReport>("/admin/import", fd);
    },
    onSuccess: (report) => {
      setImportResult(report);
      toast.success(report.message);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["meta"] });
      if (fileInput.current) fileInput.current.value = "";
    },
    onError: (err) => {
      setImportResult(null);
      toast.error(err instanceof Error ? err.message : "Import failed");
    },
  });

  const reimportBundled = useMutation({
    mutationFn: () => apiPost<ImportReport>("/admin/import-bundled"),
    onSuccess: (report) => {
      setImportResult(report);
      toast.success(report.message);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["meta"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Re-import failed"),
  });

  const d = dataset.data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">Dataset management</h1>
          <p className="mt-1 text-sm text-slate-600">
            Signed in as <strong data-testid="admin-username">{username}</strong>. Imports replace
            the catalogue and are validated before anything is written.
          </p>
        </div>
        <Button variant="outline" className="gap-2" data-testid="admin-logout-button" onClick={() => logout.mutate()}>
          <LogOut className="h-4 w-4" aria-hidden /> Sign out
        </Button>
      </div>

      {dataset.isLoading && (
        <p className="mt-8 flex items-center gap-2 text-sm text-slate-500" data-testid="admin-dataset-loading">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading dataset report…
        </p>
      )}
      {dataset.isError && (
        <p role="alert" className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800" data-testid="admin-dataset-error">
          Could not load the dataset report. Is the backend running?
        </p>
      )}

      {d && (
        <>
          {/* Stat cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: "Records loaded", value: d.record_count.toLocaleString("en-IN"), testid: "admin-record-count" },
              { label: "Central schemes", value: (d.levels.central ?? 0).toLocaleString("en-IN"), testid: "admin-central-count" },
              { label: "State / UT schemes", value: (d.levels.state ?? 0).toLocaleString("en-IN"), testid: "admin-state-count" },
              {
                label: "Last imported",
                value: d.last_imported_at
                  ? new Date(d.last_imported_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "unknown",
                testid: "admin-last-imported",
              },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="mt-1 font-mono text-2xl font-semibold text-slate-900" data-testid={s.testid}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Import controls */}
            <section className="rounded-xl border border-slate-200 bg-white p-6" data-testid="admin-import-section">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
                <Upload className="h-5 w-5 text-teal-700" aria-hidden /> Import a replacement CSV
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Upload the MyScheme catalogue CSV. The file is parsed, validated against the 16
                expected columns, cleaned and de-duplicated before anything is written. Obtain the
                dataset from{" "}
                <a href={d.source_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 hover:underline">
                  the dataset repository
                </a>
                .
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Input
                  ref={fileInput}
                  type="file"
                  accept=".csv,text/csv"
                  className="max-w-xs"
                  data-testid="admin-upload-input"
                  aria-label="CSV file to import"
                />
                <Button
                  className="gap-2"
                  data-testid="admin-upload-submit-button"
                  disabled={upload.isPending}
                  onClick={() => {
                    setImportResult(null);
                    upload.mutate();
                  }}
                >
                  {upload.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  Validate &amp; import
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  data-testid="admin-reimport-bundled-button"
                  disabled={reimportBundled.isPending || !d.bundled_file_available}
                  onClick={() => reimportBundled.mutate()}
                >
                  <RefreshCw className={`h-4 w-4 ${reimportBundled.isPending ? "animate-spin" : ""}`} aria-hidden />
                  Re-import bundled dataset
                </Button>
              </div>

              {importResult && (
                <div
                  className={`mt-4 rounded-lg border p-4 text-sm ${
                    importResult.ok ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"
                  }`}
                  data-testid="admin-import-result"
                >
                  <p className="font-semibold">{importResult.ok ? "Import complete" : "Import rejected"}</p>
                  <p className="mt-1">{importResult.message}</p>
                  {importResult.schema_ok === false && importResult.missing_columns.length > 0 && (
                    <p className="mt-1">Missing columns: {importResult.missing_columns.join(", ")}</p>
                  )}
                </div>
              )}

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900" data-testid="admin-duplicates-info">
                <p className="flex items-center gap-1.5 font-semibold">
                  <TriangleAlert className="h-3.5 w-3.5" aria-hidden /> Data quality notes
                </p>
                <p className="mt-1">
                  Duplicates in current catalogue: {d.duplicates.by_slug} by slug, {d.duplicates.by_name} by name
                  (the ingest pipeline removes both automatically). Dataset version noted:{" "}
                  {d.retrieval_date ?? "unknown"} · source: {d.source_name}.
                </p>
              </div>
            </section>

            {/* Schema / missing fields */}
            <section className="rounded-xl border border-slate-200 bg-white p-6" data-testid="admin-schema-section">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-slate-900">
                <Database className="h-5 w-5 text-teal-700" aria-hidden /> Schema &amp; missing fields
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                All 16 source columns. Missing counts are shown honestly — gaps in the source stay
                visible to citizens as data-quality warnings.
              </p>
              <div className="mt-4 max-h-80 overflow-y-auto rounded-lg border border-slate-100">
                <Table data-testid="admin-schema-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source column</TableHead>
                      <TableHead className="text-right">Missing</TableHead>
                      <TableHead className="text-right">Missing %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {d.schema_columns.map((row) => (
                      <TableRow key={row.column}>
                        <TableCell className="max-w-[280px] truncate text-xs">{row.column}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{row.missing_count.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{row.missing_pct}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default function Admin() {
  const me = useQuery({
    queryKey: ["admin", "me"],
    queryFn: () => apiGet<AdminSession>("/admin/me"),
    retry: false,
    staleTime: 60 * 1000,
  });

  if (me.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-700" aria-label="Checking session" data-testid="admin-session-loading" />
      </div>
    );
  }
  return me.data ? <DashboardView username={me.data.username} /> : <LoginView />;
}
