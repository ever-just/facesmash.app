import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

type ApiStatus = "operational" | "down" | "checking";

const StatusIndicator = () => {
  const [status, setStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("https://api.facesmash.app/api/health", {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          signal: AbortSignal.timeout(6000),
        });
        setStatus(res.ok ? "operational" : "down");
      } catch {
        setStatus("down");
      }
    };

    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, []);

  const dotClass =
    status === "operational"
      ? "bg-emerald-400 shadow-[0_0_6px_1px_rgba(52,211,153,0.5)]"
      : status === "down"
      ? "bg-red-400 shadow-[0_0_6px_1px_rgba(248,113,113,0.5)]"
      : "bg-white/30 animate-pulse";

  const label =
    status === "operational"
      ? "All systems operational"
      : status === "down"
      ? "API issue detected"
      : "Checking status…";

  return (
    <Link
      to="/status"
      className="inline-flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors group"
    >
      <span className={`size-2 rounded-full shrink-0 ${dotClass}`} />
      <span>{label}</span>
    </Link>
  );
};

export default StatusIndicator;
