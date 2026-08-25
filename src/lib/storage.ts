/**
 * localStorage CRUD 유틸
 * 근거: docs/tech-design.md 2절/3절
 *
 * 이 파일의 함수들은 반드시 "use client" 컴포넌트(주로 커스텀 훅)의
 * useEffect/이벤트 핸들러 안에서만 호출해야 한다. Next.js 서버 사이드
 * 렌더링(SSR) 중 실행되면 `window is not defined` 에러가 나기 때문에
 * `isBrowser()`로 방어한다.
 */
import type { Meta, MoneyEntry, MoneyEntryInput, Schedule, ScheduleInput } from "./types";

export const STORAGE_KEYS = {
  schedules: "personal-hub:schedules",
  moneyEntries: "personal-hub:money-entries",
  meta: "personal-hub:meta",
} as const;

export const SCHEMA_VERSION = 1;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // 저장된 값이 손상된 JSON이면 fallback으로 안전하게 대체한다.
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function generateId(): string {
  return window.crypto.randomUUID();
}

function ensureMeta(): Meta {
  const meta = readJSON<Meta | null>(STORAGE_KEYS.meta, null);
  if (meta) return meta;
  const fresh: Meta = { schemaVersion: SCHEMA_VERSION };
  writeJSON(STORAGE_KEYS.meta, fresh);
  return fresh;
}

export function getMeta(): Meta {
  return ensureMeta();
}

// ---------------------------------------------------------------------------
// Schedule CRUD
// ---------------------------------------------------------------------------

export function getSchedules(): Schedule[] {
  ensureMeta();
  return readJSON<Schedule[]>(STORAGE_KEYS.schedules, []);
}

export function getScheduleById(id: string): Schedule | undefined {
  return getSchedules().find((schedule) => schedule.id === id);
}

export function createSchedule(input: ScheduleInput): Schedule {
  const now = new Date().toISOString();
  const schedule: Schedule = {
    id: generateId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  writeJSON(STORAGE_KEYS.schedules, [...getSchedules(), schedule]);
  return schedule;
}

export function updateSchedule(
  id: string,
  patch: Partial<ScheduleInput>
): Schedule | undefined {
  const all = getSchedules();
  let updated: Schedule | undefined;
  const next = all.map((schedule) => {
    if (schedule.id !== id) return schedule;
    updated = { ...schedule, ...patch, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (updated) writeJSON(STORAGE_KEYS.schedules, next);
  return updated;
}

export function deleteSchedule(id: string): void {
  writeJSON(
    STORAGE_KEYS.schedules,
    getSchedules().filter((schedule) => schedule.id !== id)
  );
}

export function replaceSchedules(schedules: Schedule[]): void {
  writeJSON(STORAGE_KEYS.schedules, schedules);
}

// ---------------------------------------------------------------------------
// MoneyEntry CRUD
// ---------------------------------------------------------------------------

export function getMoneyEntries(): MoneyEntry[] {
  ensureMeta();
  return readJSON<MoneyEntry[]>(STORAGE_KEYS.moneyEntries, []);
}

export function getMoneyEntryById(id: string): MoneyEntry | undefined {
  return getMoneyEntries().find((entry) => entry.id === id);
}

export function createMoneyEntry(input: MoneyEntryInput): MoneyEntry {
  const now = new Date().toISOString();
  const entry: MoneyEntry = {
    id: generateId(),
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  writeJSON(STORAGE_KEYS.moneyEntries, [...getMoneyEntries(), entry]);
  return entry;
}

export function updateMoneyEntry(
  id: string,
  patch: Partial<MoneyEntryInput>
): MoneyEntry | undefined {
  const all = getMoneyEntries();
  let updated: MoneyEntry | undefined;
  const next = all.map((entry) => {
    if (entry.id !== id) return entry;
    updated = { ...entry, ...patch, updatedAt: new Date().toISOString() };
    return updated;
  });
  if (updated) writeJSON(STORAGE_KEYS.moneyEntries, next);
  return updated;
}

export function deleteMoneyEntry(id: string): void {
  writeJSON(
    STORAGE_KEYS.moneyEntries,
    getMoneyEntries().filter((entry) => entry.id !== id)
  );
}

export function replaceMoneyEntries(entries: MoneyEntry[]): void {
  writeJSON(STORAGE_KEYS.moneyEntries, entries);
}
