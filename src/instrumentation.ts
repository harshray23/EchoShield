export function register() {
  if (typeof globalThis !== 'undefined') {
    try {
      const g = globalThis as any;
      if (g.localStorage && typeof g.localStorage.getItem !== 'function') {
        delete g.localStorage;
      }
    } catch (e) {
      // safe fallback
    }
  }
}
