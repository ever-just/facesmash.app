import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, Trash2, Cookie, Database } from "lucide-react";
import { api } from "@/integrations/api/client";
import { useSignOut } from "@/hooks/useSignOut";
import { loadSettings, type UserSettings as Settings } from "@/hooks/useUserSettings";
import { useCookieConsent } from "react-cookie-manager";
import { clearNonEssentialData } from "@/utils/consentManager";

interface UserSettingsProps {
  userName: string;
}

const SETTINGS_KEY = "facesmash_user_settings";

const saveSettings = (s: Settings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  // Dispatch a storage-like event so same-tab listeners pick up changes
  window.dispatchEvent(new Event("facesmash_settings_changed"));
};

const UserSettings = ({ userName }: UserSettingsProps) => {
  const { handleSignOut } = useSignOut();
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      // Single API call deletes profile + all related data (templates, scans, logs)
      // via CASCADE in PostgreSQL
      const res = await api.deleteProfile();
      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      localStorage.removeItem(SETTINGS_KEY);
      handleSignOut();
    } catch (error) {
      console.error("Error deleting account data:", error);
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const autoLockOptions = [
    { value: 5, label: "5 min" },
    { value: 15, label: "15 min" },
    { value: 30, label: "30 min" },
    { value: 60, label: "1 hour" },
    { value: 0, label: "Never" },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
      <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] mb-6">Settings</p>

      <div className="space-y-6">
        {/* --- Recognition section --- */}
        <div>
          <p className="text-white/15 uppercase tracking-[0.15em] text-[9px] mb-4">Recognition</p>
          <div className="space-y-4">
            <SettingRow
              label="High-confidence mode"
              description="Require ≥ 85 % match to sign in (stricter security)"
            >
              <Switch
                checked={settings.requireHighConfidence}
                onCheckedChange={(v) => update("requireHighConfidence", v)}
                className="data-[state=checked]:bg-emerald-500"
              />
            </SettingRow>
          </div>
        </div>

        <Divider />

        {/* --- Session section --- */}
        <div>
          <p className="text-white/15 uppercase tracking-[0.15em] text-[9px] mb-4">Session</p>
          <div className="space-y-4">
            <SettingRow
              label="Auto-lock after inactivity"
              description="Sign out automatically after idle time"
            >
              <div className="relative">
                <select
                  value={settings.autoLockMinutes}
                  onChange={(e) => update("autoLockMinutes", Number(e.target.value))}
                  className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-lg text-white/70 text-sm pl-3 pr-8 py-1.5 focus:outline-none focus:border-emerald-500/40 cursor-pointer"
                >
                  {autoLockOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-[#0E1014] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-white/30 pointer-events-none" />
              </div>
            </SettingRow>

            <SettingRow
              label="Login notifications"
              description="Show a confirmation after each successful sign-in"
            >
              <Switch
                checked={settings.loginNotifications}
                onCheckedChange={(v) => update("loginNotifications", v)}
                className="data-[state=checked]:bg-emerald-500"
              />
            </SettingRow>
          </div>
        </div>

        <Divider />

        {/* --- Display section --- */}
        <div>
          <p className="text-white/15 uppercase tracking-[0.15em] text-[9px] mb-4">Display</p>
          <div className="space-y-4">
            <SettingRow
              label="Show activity history"
              description="Display your recent sign-in sessions on the dashboard"
            >
              <Switch
                checked={settings.showActivityHistory}
                onCheckedChange={(v) => update("showActivityHistory", v)}
                className="data-[state=checked]:bg-emerald-500"
              />
            </SettingRow>

            <SettingRow
              label="Compact mode"
              description="Reduce spacing for smaller screens"
            >
              <Switch
                checked={settings.compactMode}
                onCheckedChange={(v) => update("compactMode", v)}
                className="data-[state=checked]:bg-emerald-500"
              />
            </SettingRow>
          </div>
        </div>

        <Divider />

        {/* --- Privacy & Data section --- */}
        <div>
          <p className="text-white/15 uppercase tracking-[0.15em] text-[9px] mb-4">Privacy & Data</p>
          <div className="space-y-4">
            <PrivacyControls />
          </div>
        </div>

        <Divider />

        {/* --- Danger zone --- */}
        <div>
          <p className="text-red-400/40 uppercase tracking-[0.15em] text-[9px] mb-4">Danger zone</p>
          <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-white/60 text-sm font-medium">Delete account data</p>
                <p className="text-white/20 text-xs mt-0.5">
                  Remove all face templates, scans, and sign-in history. This cannot be undone.
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  confirmDelete
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                } disabled:opacity-50`}
              >
                <Trash2 className="size-3" />
                {deleting ? "Deleting..." : confirmDelete ? "Confirm delete" : "Delete data"}
              </button>
            </div>
            {confirmDelete && !deleting && (
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-white/30 text-xs mt-3 hover:text-white/50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Shared sub-components ── */

const SettingRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0 flex-1">
      <p className="text-white/60 text-sm">{label}</p>
      <p className="text-white/20 text-xs mt-0.5">{description}</p>
    </div>
    <div className="shrink-0 pt-0.5">{children}</div>
  </div>
);

const Divider = () => <div className="border-t border-white/[0.04]" />;

const PrivacyControls = () => {
  const { showConsentBanner, detailedConsent } = useCookieConsent();
  const [cleared, setCleared] = useState(false);

  const handleClearCache = () => {
    clearNonEssentialData();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const analyticsEnabled = detailedConsent?.Analytics?.consented ?? false;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-white/60 text-sm">Cookie preferences</p>
          <p className="text-white/20 text-xs mt-0.5">
            Analytics: <span className={analyticsEnabled ? "text-emerald-400" : "text-white/40"}>{analyticsEnabled ? "Enabled" : "Disabled"}</span>
          </p>
        </div>
        <button
          onClick={showConsentBanner}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white/60 border border-white/[0.08] transition-colors"
        >
          <Cookie className="size-3" />
          Manage
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-white/60 text-sm">Clear cached data</p>
          <p className="text-white/20 text-xs mt-0.5">Remove non-essential cached data from your browser</p>
        </div>
        <button
          onClick={handleClearCache}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white/60 border border-white/[0.08] transition-colors"
        >
          <Database className="size-3" />
          {cleared ? "Cleared!" : "Clear"}
        </button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-white/60 text-sm">Export your data</p>
          <p className="text-white/20 text-xs mt-0.5">Request a copy of your stored data</p>
        </div>
        <a
          href="mailto:privacy@facesmash.app?subject=Data%20Export%20Request"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white/60 border border-white/[0.08] transition-colors"
        >
          Request
        </a>
      </div>
    </div>
  );
};

export default UserSettings;
