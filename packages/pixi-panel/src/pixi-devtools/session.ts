const namespace = "devtools:";
const session = {
  get<T>(key: string): T | undefined {
    try {
      const value = sessionStorage.getItem(namespace + key);
      if (value === null) {
        return undefined;
      }
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  },
  set(key: string, value: unknown) {
    try {
      sessionStorage.setItem(namespace + key, JSON.stringify(value));
    } catch {
      return;
    }
  },
};
export default session;
