export function resetLocaleState(): void {
  localStorage.clear();
  document.cookie = "locale=;path=/;max-age=0";
  document.documentElement.lang = "";
}
