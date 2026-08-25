"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import * as storage from "@/lib/storage";
import type { Schedule, ScheduleInput } from "@/lib/types";

/**
 * 일정(Schedule) 데이터를 다루는 커스텀 훅.
 * localStorage 접근은 이 훅 내부(useEffect/콜백)에서만 일어나며,
 * 화면 컴포넌트는 이 훅을 통해서만 일정 데이터를 읽고 쓴다.
 */
export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const refresh = useCallback(() => {
    setSchedules(storage.getSchedules());
  }, []);

  useEffect(() => {
    refresh();
    setIsLoaded(true);
  }, [refresh]);

  const addSchedule = useCallback(
    (input: ScheduleInput) => {
      const created = storage.createSchedule(input);
      refresh();
      return created;
    },
    [refresh]
  );

  const editSchedule = useCallback(
    (id: string, patch: Partial<ScheduleInput>) => {
      const updated = storage.updateSchedule(id, patch);
      refresh();
      return updated;
    },
    [refresh]
  );

  const removeSchedule = useCallback(
    (id: string) => {
      storage.deleteSchedule(id);
      refresh();
    },
    [refresh]
  );

  /** 오늘 날짜의 일정만 시간순으로 정렬해서 반환 (dash-1) */
  const getTodaySchedules = useCallback(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return schedules
      .filter((schedule) => schedule.date === today)
      .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  }, [schedules]);

  /** 특정 날짜("YYYY-MM-DD")의 일정만 시간순으로 정렬해서 반환 (cal-4) */
  const getSchedulesByDate = useCallback(
    (date: string) => {
      return schedules
        .filter((schedule) => schedule.date === date)
        .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    },
    [schedules]
  );

  /** 일정이 있는 날짜 집합 (캘린더 마커 표시용, cal-3) */
  const scheduledDateSet = useMemo(
    () => new Set(schedules.map((schedule) => schedule.date)),
    [schedules]
  );

  return {
    schedules,
    isLoaded,
    addSchedule,
    editSchedule,
    removeSchedule,
    getTodaySchedules,
    getSchedulesByDate,
    scheduledDateSet,
    refresh,
  };
}
