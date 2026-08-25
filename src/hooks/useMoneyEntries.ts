"use client";

import { useCallback, useEffect, useState } from "react";
import * as storage from "@/lib/storage";
import type { MoneyEntry, MoneyEntryInput } from "@/lib/types";

/**
 * 용돈(수입/지출) 데이터를 다루는 커스텀 훅.
 * localStorage 접근은 이 훅 내부(useEffect/콜백)에서만 일어난다.
 */
export function useMoneyEntries() {
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setEntries(storage.getMoneyEntries());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);
  }, [refresh]);

  const addMoneyEntry = useCallback(
    (input: MoneyEntryInput) => {
      const created = storage.createMoneyEntry(input);
      refresh();
      return created;
    },
    [refresh]
  );

  const editMoneyEntry = useCallback(
    (id: string, patch: Partial<MoneyEntryInput>) => {
      const updated = storage.updateMoneyEntry(id, patch);
      refresh();
      return updated;
    },
    [refresh]
  );

  const removeMoneyEntry = useCallback(
    (id: string) => {
      storage.deleteMoneyEntry(id);
      refresh();
    },
    [refresh]
  );

  /** 날짜 내림차순(최신순) 정렬된 전체 목록 (money-list-1 기본 정렬) */
  const getSortedEntries = useCallback(() => {
    return [...entries].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [entries]);

  /** 최근 N건의 용돈 기입 내역 (dash-2, 기본 5건) */
  const getRecentEntries = useCallback(
    (limit = 5) => {
      return getSortedEntries().slice(0, limit);
    },
    [getSortedEntries]
  );

  return {
    entries,
    isLoaded,
    addMoneyEntry,
    editMoneyEntry,
    removeMoneyEntry,
    getSortedEntries,
    getRecentEntries,
    refresh,
  };
}
