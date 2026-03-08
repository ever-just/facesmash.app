import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Server,
  BookOpen,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ── Types ── */
interface ServiceCheck {
  name: string;
  url: string;
  description: string;
  icon: React.ReactNode;
  status: "operational" | "degraded" | "down" | "checking";
  latency: number | null;
  lastChecked: Date | null;
}

interface UptimeEntry {
  timestamp: Date;
  status: "up" | "down";
  latency: number;
}

/* ── Service definitions (static — never changes) ── */
const SERVICE_DEFS: { name: string; url: string; description: string; corsMode: RequestMode; icon: React.ReactNode }[] = [
  {
    name: "FaceSmash App",
    url: "https://facesmash.app",
    description: "Main web application (Netlify)",
    corsMode: "no-cors",
    icon: <Globe className="size-5 text-emerald-400" />,
  },
  {
    name: "PocketBase API",
    url: "https://api.facesmash.app/api/health",
    description: "Backend REST API (DigitalOcean)",
    corsMode: "cors",
    icon: <Server className="size-5 text-teal-400" />,
  },
  {
    name: "Documentation",
    url: "https://docs.facesmash.app",
    description: "Developer docs (Netlify)",
    corsMode: "no-cors",
    icon: <BookOpen className="size-5 text-purple-400" />,
  },
];

/* ── Ping helper ── */
const pingService = async (
  url: string,
  corsMode: RequestMode
): Promise<{ ok: boolean; latency: number }> => {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      mode: corsMode,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const latency = Math.round(performance.now() - start);
    if (corsMode === "no-cors") {
      return { ok: res.type === "opaque" || res.ok, latency };
    }
    return { ok: res.ok, latency };
  } catch {
    const latency = Math.round(performance.now() - start);
    return { ok: false, latency };
  }
};

/* ── Component ── */
const Status = () => {
  const [services, setServices] = useState<ServiceCheck[]>(
    SERVICE_DEFS.map((d) => ({
      ...d,
      status: "checking" as const,
      latency: null,
      lastChecked: null,
    }))
  );

  const [uptimeLog, setUptimeLog] = useState<UptimeEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const runChecks = useCallback(async () => {
    setRefreshing(true);
    const now = new Date();

    const updated = await Promise.all(
      SERVICE_DEFS.map(async (def) => {
        const { ok, latency } = await pingService(def.url, def.corsMode);
        return {
          name: def.name,
          url: def.url,
          description: def.description,
          icon: def.icon,
          status: ok
            ? ("operational" as const)
            : latency > 5000
            ? ("degraded" as const)
            : ("down" as const),
          latency,
          lastChecked: now,
        };
      })
    );

    setServices(updated);

    // Log the API check for uptime history
    const apiCheck = updated.find((s) => s.name === "PocketBase API");
    if (apiCheck) {
      setUptimeLog((prev) => {
        const entry: UptimeEntry = {
          timestamp: now,
          status: apiCheck.status === "operational" ? "up" : "down",
          latency: apiCheck.latency ?? 0,
        };
        const next = [...prev, entry];
        return next.slice(-60);
      });
    }

    setRefreshing(false);
  }, []);

  // Initial check + auto-refresh every 30s
  useEffect(() => {
    runChecks();
  }, [runChecks]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(runChecks, 30000);
    return () => clearInterval(id);
  }, [autoRefresh, runChecks]);

  /* ── Derived stats ── */
  const allOperational = services.every((s) => s.status === "operational");
  const anyDown = services.some((s) => s.status === "down");
  const overallStatus = allOperational
    ? "All Systems Operational"
    : anyDown
    ? "Partial Outage"
    : "Checking...";

  const avgLatency =
    services.filter((s) => s.latency !== null).length > 0
      ? Math.round(
          services.reduce((sum, s) => sum + (s.latency ?? 0), 0) /
            services.filter((s) => s.latency !== null).length
        )
      : null;

  const uptimePercent =
    uptimeLog.length > 0
      ? (
          (uptimeLog.filter((e) => e.status === "up").length /
            uptimeLog.length) *
          100
        ).toFixed(2)
      : "—";

  const statusColor = allOperational
    ? "emerald"
    : anyDown
    ? "red"
    : "yellow";

  return (
    <div className="bg-[#07080A] text-white min-h-screen selection:bg-emerald-500/30">
      <SEOHead
        path="/status"
        title="System Status"
        description="Real-time status and uptime monitoring for FaceSmash services."
      />

      {/* film-grain */}
      <div className="fixed inset-0 pointer-events-none z-[100] animate-grain opacity-40 mix-blend-overlay" />

      {/* Nav minimal */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#07080A]/70 border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-2.5 group"
          >
            <img
              src="/facesmash-logo.png"
              alt="FaceSmash"
              className="size-8 rounded-lg shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow"
            />
            <span className="text-[15px] sm:text-[17px] font-semibold tracking-tight">
              FaceSmash
            </span>
          </Link>
          <Link to="/">
            <Button
              variant="ghost"
              className="text-white/50 hover:text-white text-sm h-9 px-3 gap-2"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-28 sm:pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity className="size-5 text-white/40" />
              <p className="text-white/20 uppercase tracking-[0.25em] text-xs">
                System Status
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Service Health
            </h1>

            {/* Overall status banner */}
            <div
              className={`flex items-center gap-3 px-5 py-4 rounded-xl border mb-10 ${
                statusColor === "emerald"
                  ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                  : statusColor === "red"
                  ? "border-red-500/20 bg-red-500/[0.06]"
                  : "border-yellow-500/20 bg-yellow-500/[0.06]"
              }`}
            >
              <div
                className={`size-3 rounded-full ${
                  statusColor === "emerald"
                    ? "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.4)]"
                    : statusColor === "red"
                    ? "bg-red-400 shadow-[0_0_8px_2px_rgba(248,113,113,0.4)]"
                    : "bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.4)]"
                } animate-pulse`}
              />
              <span
                className={`font-semibold ${
                  statusColor === "emerald"
                    ? "text-emerald-400"
                    : statusColor === "red"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {overallStatus}
              </span>
              <div className="ml-auto flex items-center gap-3">
                <button
                  onClick={runChecks}
                  disabled={refreshing}
                  className="text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
                  title="Refresh now"
                >
                  <RefreshCw
                    className={`size-4 ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Service cards */}
          <div className="space-y-4 mb-12">
            {services.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="size-10 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                  {svc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{svc.name}</p>
                  <p className="text-xs text-white/30 truncate">
                    {svc.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  {svc.latency !== null && (
                    <span className="text-xs text-white/25 font-mono">
                      {svc.latency}ms
                    </span>
                  )}
                  {svc.status === "operational" ? (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-4 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-medium">
                        Operational
                      </span>
                    </div>
                  ) : svc.status === "down" ? (
                    <div className="flex items-center gap-1.5">
                      <XCircle className="size-4 text-red-400" />
                      <span className="text-xs text-red-400 font-medium">
                        Down
                      </span>
                    </div>
                  ) : svc.status === "degraded" ? (
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-4 text-yellow-400" />
                      <span className="text-xs text-yellow-400 font-medium">
                        Degraded
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-white/20">Checking…</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Metrics row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            <div className="text-center p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-2xl font-bold text-emerald-400">
                {uptimePercent}%
              </p>
              <p className="text-xs text-white/30 mt-1">
                Uptime (this session)
              </p>
            </div>
            <div className="text-center p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-2xl font-bold">
                {avgLatency !== null ? `${avgLatency}ms` : "—"}
              </p>
              <p className="text-xs text-white/30 mt-1">Avg Latency</p>
            </div>
            <div className="text-center p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <p className="text-2xl font-bold">{uptimeLog.length}</p>
              <p className="text-xs text-white/30 mt-1">Checks Run</p>
            </div>
          </motion.div>

          {/* Latency chart — mini bar chart */}
          {uptimeLog.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 mb-12"
            >
              <p className="text-sm font-medium mb-1">
                API Response Time
              </p>
              <p className="text-xs text-white/30 mb-6">
                Last {uptimeLog.length} checks (every 30s)
              </p>
              <div className="flex items-end gap-[2px] h-24">
                {uptimeLog.map((entry, i) => {
                  const maxL = Math.max(
                    ...uptimeLog.map((e) => e.latency),
                    1
                  );
                  const pct = Math.max(
                    (entry.latency / maxL) * 100,
                    4
                  );
                  return (
                    <div
                      key={i}
                      className="flex-1 min-w-[3px] rounded-t transition-all"
                      style={{ height: `${pct}%` }}
                      title={`${entry.latency}ms at ${entry.timestamp.toLocaleTimeString()}`}
                    >
                      <div
                        className={`w-full h-full rounded-t ${
                          entry.status === "up"
                            ? "bg-emerald-400/60"
                            : "bg-red-400/60"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-white/15">
                <span>
                  {uptimeLog[0]?.timestamp.toLocaleTimeString()}
                </span>
                <span>
                  {uptimeLog[
                    uptimeLog.length - 1
                  ]?.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          )}

          {/* Recent checks log */}
          {uptimeLog.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6"
            >
              <p className="text-sm font-medium mb-4">Recent API Checks</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {[...uptimeLog]
                  .reverse()
                  .slice(0, 15)
                  .map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs"
                    >
                      <div
                        className={`size-2 rounded-full ${
                          entry.status === "up"
                            ? "bg-emerald-400"
                            : "bg-red-400"
                        }`}
                      />
                      <span className="text-white/25 font-mono w-20">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                      <span
                        className={
                          entry.status === "up"
                            ? "text-emerald-400/70"
                            : "text-red-400/70"
                        }
                      >
                        {entry.status === "up"
                          ? "Operational"
                          : "Down"}
                      </span>
                      <span className="ml-auto text-white/20 font-mono">
                        {entry.latency}ms
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {/* Auto-refresh toggle */}
          <div className="flex items-center justify-center gap-3 mt-8 text-xs text-white/25">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-full border transition-all ${
                autoRefresh
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.08] bg-white/[0.03] text-white/40"
              }`}
            >
              {autoRefresh
                ? "Auto-refresh: ON (30s)"
                : "Auto-refresh: OFF"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Status;
