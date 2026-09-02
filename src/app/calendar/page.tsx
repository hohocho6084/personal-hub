"use client";

import { useState } from "react";
import Link from "next/link";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSchedules } from "@/hooks/useSchedules";

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { getSchedulesByDate, scheduledDateSet, isLoaded } = useSchedules();

  const gridStart = startOfWeek(startOfMonth(currentMonth));
  const gridEnd = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDateSchedules = getSchedulesByDate(selectedDateKey);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-sm font-bold text-ink-navy">캘린더</h1>

      <Card>
        <CardContent className="flex flex-col gap-4">
          {/* 월 이동 (cal-2) */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              aria-label="이전 달"
              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-body-lg font-semibold text-ink-navy">
              {format(currentMonth, "yyyy년 M월")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="다음 달"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 월간 달력 그리드 (cal-1) */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-1 text-caption font-medium text-slate-gray"
              >
                {label}
              </div>
            ))}
            {days.map((day) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const inCurrentMonth = isSameMonth(day, currentMonth);
              const hasSchedule = scheduledDateSet.has(dateKey);
              const selected = isSameDay(day, selectedDate);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-body-sm transition-colors",
                    inCurrentMonth ? "text-ink-navy" : "text-mist-gray",
                    selected
                      ? "bg-signal-blue text-paper"
                      : "hover:bg-pebble",
                    !selected && isToday(day) && "font-bold text-signal-blue"
                  )}
                >
                  <span>{format(day, "d")}</span>
                  {hasSchedule && (
                    <span
                      className={cn(
                        "h-1 w-1 rounded-full",
                        selected ? "bg-paper" : "bg-signal-blue"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 선택한 날짜의 일정 목록 (cal-4) */}
      <div className="flex flex-col gap-2">
        <h2 className="text-body-lg font-semibold text-ink-navy">
          {format(selectedDate, "yyyy년 M월 d일")} 일정
        </h2>
        {!isLoaded ? (
          <p className="text-body-sm text-slate-gray">불러오는 중...</p>
        ) : selectedDateSchedules.length === 0 ? (
          <p className="text-body-sm text-slate-gray">
            이 날짜에 등록된 일정이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedDateSchedules.map((schedule) => (
              <li key={schedule.id}>
                {/* 일정 클릭 시 상세 화면으로 이동 (cal-5) */}
                <Link
                  href={`/schedule/detail?id=${schedule.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-pebble/40 px-3 py-2 transition-colors hover:bg-pebble"
                >
                  <span className="min-w-0 truncate text-body-sm font-medium text-ink-navy">
                    {schedule.title}
                  </span>
                  {schedule.time && (
                    <span className="shrink-0 text-caption text-slate-gray">
                      {schedule.time}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
