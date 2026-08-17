const namespace = "devtools:";

const sessionStorageCache = new Map<string, unknown>();
const localStorageCache = new Map<string, unknown>();

/**
 * Storage backed by sessionStorage, with cached JSON deserialization  
 */
export const session = {
  get<T>(key: string): T | undefined {
    if (!sessionStorageCache.has(key)) {
      sessionStorageCache.set(key, read<T>(sessionStorage, key));
    }
    return sessionStorageCache.get(key) as T;
  },
  set(key: string, value: unknown) {
    write(sessionStorage, key, value);
    sessionStorageCache.set(key, value);
  },
};

/**
 * Storage backed by localStorage, with cached JSON deserialization  
 */
export const persistent = {
  get<T>(key: string): T | undefined {
    if (!localStorageCache.has(key)) {
      localStorageCache.set(key, read<T>(localStorage, key));
    }
    return localStorageCache.get(key) as T;
  },
  set(key: string, value: unknown) {
    write(localStorage, key, value);
    localStorageCache.set(key, value);
  },
};

// Remove cached value when changed externally
window.addEventListener("storage", ({ key }) => {
  if (key && key.startsWith(namespace)) {
    localStorageCache.delete(key.substring(namespace.length));
  }
});

function read<T>(storage: Storage, key: string): T | undefined {
  try {
    const value = storage.getItem(namespace + key);
    if (value === null) {
      return undefined;
    }
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    storage.setItem(namespace + key, JSON.stringify(value));
  } catch {
    return;
  }
}
