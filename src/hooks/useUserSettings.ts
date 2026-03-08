import { useState, useEffect, useCallback } from "react";

export interface UserSettings {
  autoLockMinutes: number;
  requireHighConfidence: boolean;
  loginNotifications: boolean;
  showActivityHistory: boolean;
  compactMode: boolean;
}

const SETTINGS_KEY = "facesmash_user_settings";

const defaultSettings: UserSettings = {
  autoLockMinutes: 30,
  requireHighConfidence: false,
  loginNotifications: true,
  showActivityHistory: true,
  compactMode: false,
};

export const loadSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...defaultSettings };
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(loadSettings);

  // Listen for changes from other tabs (StorageEvent) and same-tab (custom event)
  useEffect(() => {
    const reload = () => setSettings(loadSettings());
    const onStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY) reload();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("facesmash_settings_changed", reload);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("facesmash_settings_changed", reload);
    };
  }, []);

  return settings;
};
