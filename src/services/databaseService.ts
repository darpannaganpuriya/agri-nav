export type AccountRole = "farmer" | "storage_owner";

export interface AuthAccountRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: AccountRole;
  hasStorage?: boolean;
}

const DB_NAME = "fasalseva-db";
const STORE_NAME = "accounts";
const FALLBACK_KEY = "fasalseva.accounts";

function isBrowser() {
  return typeof window !== "undefined";
}

function readFallbackAccounts(): AuthAccountRecord[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(localStorage.getItem(FALLBACK_KEY) || "[]") as AuthAccountRecord[];
  } catch {
    return [];
  }
}

function writeFallbackAccounts(accounts: AuthAccountRecord[]) {
  if (!isBrowser()) return;
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(accounts));
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser() || !("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAccount(account: AuthAccountRecord): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(account);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    const accounts = readFallbackAccounts();
    writeFallbackAccounts([...accounts.filter((item) => item.id !== account.id), account]);
  }
}

export async function getAccounts(): Promise<AuthAccountRecord[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    const accounts = await new Promise<AuthAccountRecord[]>((resolve, reject) => {
      request.onsuccess = () => resolve((request.result || []) as AuthAccountRecord[]);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return accounts;
  } catch {
    return readFallbackAccounts();
  }
}

export async function getAccountByEmail(email: string): Promise<AuthAccountRecord | undefined> {
  const accounts = await getAccounts();
  return accounts.find((account) => account.email.toLowerCase() === email.toLowerCase());
}
