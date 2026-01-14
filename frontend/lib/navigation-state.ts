const stateStore = new Map<string, unknown>();

const normalizePath = (path: string) => {
  if (!path) return '/';
  const url = path.split('?')[0] ?? path;
  if (url.length > 1 && url.endsWith('/')) {
    return url.slice(0, -1);
  }
  return url || '/';
};

const storageKey = (path: string) => `route-state:${normalizePath(path)}`;

export const setRouteState = (path: string, state: unknown) => {
  const key = normalizePath(path);
  stateStore.set(key, state);

  if (typeof window !== 'undefined') {
    try {
      window.sessionStorage.setItem(storageKey(path), JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to persist route state', error);
    }
  }
};

export const getRouteState = <T>(path: string): T | null => {
  const key = normalizePath(path);
  if (stateStore.has(key)) {
    return stateStore.get(key) as T;
  }

  if (typeof window !== 'undefined') {
    const serialized = window.sessionStorage.getItem(storageKey(path));
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized) as T;
        stateStore.set(key, parsed);
        return parsed;
      } catch (error) {
        console.warn('Failed to parse stored route state', error);
      }
    }
  }

  return null;
};
