const STORAGE_KEY = 'theme';
const THEMES = ['light', 'dark'];

const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

const isValidTheme = (value) => THEMES.includes(value);

const readStoredTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isValidTheme(stored) ? stored : null;
  } catch {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the theme still applies for this visit.
  }
};

const systemPrefersDark = () => darkQuery.matches;

const getSystemTheme = () => (systemPrefersDark() ? 'dark' : 'light');

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
};

const syncButton = (button, theme) => {
  button.setAttribute('aria-pressed', String(theme === 'dark'));
};

const handleSystemChange = (event) => {
  applyTheme(event.matches ? 'dark' : 'light');
  const button = document.querySelector('#theme-btn');
  if (button) {
    syncButton(button, document.documentElement.dataset.theme);
  }
};

const initButton = () => {
  const button = document.querySelector('#theme-btn');
  if (!button) {
    return;
  }

  syncButton(button, document.documentElement.dataset.theme);

  button.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    syncButton(button, nextTheme);
    storeTheme(nextTheme);
    darkQuery.removeEventListener('change', handleSystemChange);
  });
};

const storedTheme = readStoredTheme();
applyTheme(storedTheme ?? getSystemTheme());

if (storedTheme === null) {
  darkQuery.addEventListener('change', handleSystemChange);
}

document.addEventListener('DOMContentLoaded', () => initButton(), { once: true });
