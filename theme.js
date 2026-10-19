// Apply the preference before CSS loads to avoid a flash of the wrong theme.
(() => {
 'use strict';
 const key = 'facilgest_theme';
 const system = window.matchMedia('(prefers-color-scheme: dark)');
 let preference;
 try { preference = localStorage.getItem(key); } catch { /* Theme still works without storage. */ }
 if (!['light', 'dark'].includes(preference)) preference = null;
 function apply(theme) {
  document.documentElement.dataset.theme = theme;
  const button = document.getElementById('themeSwitch');
  if (button) {
   button.setAttribute('aria-checked', String(theme === 'dark'));
   document.getElementById('themeLabel').textContent = theme === 'dark' ? 'Modo oscuro' : 'Modo claro';
  }
 }
 apply(preference || (system.matches ? 'dark' : 'light'));
 document.addEventListener('DOMContentLoaded', () => {
  apply(document.documentElement.dataset.theme);
  document.getElementById('themeSwitch').addEventListener('click', () => {
   preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
   apply(preference);
   try { localStorage.setItem(key, preference); } catch { /* Keep selection for this page. */ }
  });
 });
 system.addEventListener('change', e => { if (!preference) apply(e.matches ? 'dark' : 'light'); });
 window.addEventListener('storage', e => {
  if (e.key !== key && e.key !== null) return;
  preference = ['light', 'dark'].includes(e.newValue) ? e.newValue : null;
  apply(preference || (system.matches ? 'dark' : 'light'));
 });
})();
