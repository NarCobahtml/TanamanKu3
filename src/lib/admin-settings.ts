import fs from 'node:fs';
import path from 'node:path';

export interface SystemSettings {
  allowRegistration: boolean;
  maintenanceMode: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  allowRegistration: true,
  maintenanceMode: false,
};

const SETTINGS_FILE = path.join(process.cwd(), 'src', 'lib', 'system-settings.json');

export function getSystemSettings(): SystemSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const content = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
    }
  } catch (err) {
    console.warn('Failed to read system-settings.json:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveSystemSettings(settings: Partial<SystemSettings>): SystemSettings {
  const current = getSystemSettings();
  const updated = { ...current, ...settings };
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed to write system-settings.json:', err);
  }
  return updated;
}
