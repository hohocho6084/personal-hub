"use client";

import Link from "next/link";
import { useSchedules } from "@/hooks/useSchedules";
import { useMoneyEntries } from "@/hooks/useMoneyEntries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackupControls } from "@/components/backup/backup-controls";
import { CalendarDays, Wallet, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function DashboardPage() {
  const { getTodaySchedules, isLoaded: isSchedulesLoaded } = useSchedules();
  const { getRecentEntries, isLoaded: isEntriesLoaded } = useMoneyEntries();

  const todaySchedules = getTodaySchedules();
  const recentEntries = getRecentEntries(5);
  const today = format(new Date(), "yyyy년 M월 d일");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-sm font-bold text-ink-navy">대시보드</h1>
        <p className="text-body-sm text-slate-gray">{today}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 오늘 일정 요약 (dash-1) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-body-lg text-ink-navy">
                <CalendarDays className="h-5 w-5 text-signal-blue" />
                오늘 일정
              </CardTitle>
              <Link
                href="/calendar"
                className="flex items-center gap-1 text-body-sm font-medium text-signal-blue hover:underline"
              >
                캘린더 보기
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CardDescription>오늘 등록된 일정을 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSchedulesLoaded ? (
              <p className="text-body-sm text-slate-gray">불러오는 중...</p>
            ) : todaySchedules.length === 0 ? (
              <p className="text-body-sm text-slate-gray">
                오늘 등록된 일정이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {todaySchedules.map((schedule) => (
                  <li key={schedule.id}>
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
          </CardContent>
        </Card>

        {/* 최근 용돈 기입 요약 (dash-2) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-body-lg text-ink-navy">
                <Wallet className="h-5 w-5 text-signal-blue" />
                최근 용돈 기입
              </CardTitle>
              <Link
                href="/money"
                className="flex items-center gap-1 text-body-sm font-medium text-signal-blue hover:underline"
              >
                전체 보기
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CardDescription>
              최근 등록된 수입/지출 내역입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEntriesLoaded ? (
              <p className="text-body-sm text-slate-gray">불러오는 중...</p>
            ) : recentEntries.length === 0 ? (
              <p className="text-body-sm text-slate-gray">
                등록된 용돈 기입 내역이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recentEntries.map((entry) => (
                  <li key={entry.id}>
                    <Link
                      href={`/money/detail?id=${entry.id}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-pebble/40 px-3 py-2 transition-colors hover:bg-pebble"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={
                            entry.type === "income"
                              ? "shrink-0 bg-income-green/10 text-income-green"
                              : "shrink-0 bg-expense-red/10 text-expense-red"
                          }
                        >
                          {entry.type === "income" ? "수입" : "지출"}
                        </Badge>
                        <span className="min-w-0 truncate text-body-sm font-medium text-ink-navy">
                          {entry.title}
                        </span>
                      </div>
                      <span
                        className={
                          entry.type === "income"
                            ? "shrink-0 text-body-sm font-semibold text-income-green"
                            : "shrink-0 text-body-sm font-semibold text-expense-red"
                        }
                      >
                        {entry.type === "income" ? "+" : "-"}
                        {entry.amount.toLocaleString()}원
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 다른 화면 바로가기 (dash-3) */}
      <div className="flex flex-wrap gap-3">
        <Button nativeButton={false} render={<Link href="/schedule/new" />}>
          일정 등록하기
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/calendar" />}
        >
          캘린더로 이동
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/money" />}
        >
          용돈 기입장으로 이동
        </Button>
      </div>

      {/* 데이터 백업 (dash-4, 실제 로직은 작업 단위 9에서 연결) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-body-lg text-ink-navy">
            데이터 백업
          </CardTitle>
          <CardDescription>
            일정·용돈 데이터를 JSON 파일로 내보내거나, 내보낸 파일을 불러와
            복원할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackupControls />
        </CardContent>
      </Card>
    </div>
  );
}
