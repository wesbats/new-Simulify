const DB_NAME = 'simulify-local';
const DB_VERSION = 1;
const STORE_NAME = 'state';
const SYNC_KEY = 'simulify_local_sync_v1';
const memoryCache = new Map<string, string>();
let mirrorTimer: number | undefined;

const KEYS = [
  'simulify_custom_simulados_v1',
  'simulify_exam_results_v1',
  'simulify_active_session_v1',
  'simulify_question_bank_v1',
  'simulify_daily_goal_v1',
  'simulify_weekly_goal_v2',
  'simulify_study_preferences_v1',
  SYNC_KEY,
];

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readAll(): Promise<Record<string, string>> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const result: Record<string, string> = {};
    let pending = KEYS.length;

    if (pending === 0) {
      resolve(result);
      return;
    }

    KEYS.forEach((key) => {
      const request = store.get(key);
      request.onsuccess = () => {
        if (typeof request.result === 'string') result[key] = request.result;
        pending -= 1;
        if (pending === 0) resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  });
}

export async function hydrateFromIndexedDB(): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;

  try {
    const stored = await readAll();
    const localSync = Number(localStorage.getItem(SYNC_KEY) || 0);
    const indexedDbSync = Number(stored[SYNC_KEY] || 0);
    if (localSync > indexedDbSync) {
      KEYS.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) memoryCache.set(key, value);
      });
      await mirrorLocalStorage();
    } else {
      KEYS.forEach((key) => {
        if (stored[key]) {
          memoryCache.set(key, stored[key]);
          localStorage.setItem(key, stored[key]);
        }
      });
    }
  } catch (error) {
    console.warn('Persistência local avançada indisponível, usando fallback do navegador.', error);
  }
}

export function readPersisted(key: string): string | null {
  return memoryCache.get(key) ?? localStorage.getItem(key);
}

export function writePersisted(key: string, value: string): void {
  memoryCache.set(key, value);
  localStorage.setItem(key, value);
  const syncVersion = String(Date.now());
  memoryCache.set(SYNC_KEY, syncVersion);
  localStorage.setItem(SYNC_KEY, syncVersion);
  scheduleMirror();
}

export function deletePersisted(key: string): void {
  memoryCache.delete(key);
  localStorage.removeItem(key);
  const syncVersion = String(Date.now());
  memoryCache.set(SYNC_KEY, syncVersion);
  localStorage.setItem(SYNC_KEY, syncVersion);
  scheduleMirror();
}

function scheduleMirror(): void {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;
  if (mirrorTimer) window.clearTimeout(mirrorTimer);
  mirrorTimer = window.setTimeout(() => {
    mirrorTimer = undefined;
    void mirrorLocalStorage();
  }, 150);
}

export async function mirrorLocalStorage(): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;

  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) store.put(value, key);
      else store.delete(key);
    });
  } catch (error) {
    console.warn('Não foi possível espelhar os dados locais.', error);
  }
}
