const SETTINGS_KEY = "qc:settings:v1";

export const SETTINGS_DEFAULTS = {
  theme: "default",
  zoom: 100,
  glass: true,
  compact: false,
  animations: true,
  sound: false,
  showLesson: true,
  language: "pt-BR",
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...SETTINGS_DEFAULTS, ...JSON.parse(raw) } : { ...SETTINGS_DEFAULTS };
  } catch {
    return { ...SETTINGS_DEFAULTS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
