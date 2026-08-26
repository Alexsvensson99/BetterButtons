(() => {
  let theme = window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  try {
    theme = localStorage.getItem('betterbuttons-theme') || theme;
  } catch {
    // Browser storage can be disabled; the system preference remains the fallback.
  }
  document.documentElement.classList.toggle('theme-light', theme === 'light');
})();
