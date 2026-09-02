"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MoneyAddDialog } from "@/components/money/money-add-dialog";
import { useMoneyEntries } from "@/hooks/useMoneyEntries";

export default function MoneyListPage() {
  const { getSortedEntries, isLoaded } = useMoneyEntries();
  const entries = getSortedEntries();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-heading-sm font-bold text-ink-navy">
          용돈 기입장
        </h1>
        <MoneyAddDialog />
      </div>

      {!isLoaded ? (
        <p className="text-body-sm text-slate-gray">불러오는 중...</p>
      ) : entries.length === 0 ? (
        <p className="text-body-sm text-slate-gray">
          등록된 수입/지출 내역이 없습니다.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((entry) => (
            <li key={entry.id}>
              {/* 목록에서 항목 클릭 시 상세 화면으로 이동 (money-list-4) */}
              <Link
                href={`/money/detail?id=${entry.id}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-hairline bg-paper px-4 py-3 shadow-sm transition-colors hover:bg-pebble/50"
              >
                <div className="flex min-w-0 items-center gap-3">
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
                  <div className="flex min-w-0 flex-col">
                    <span className="min-w-0 truncate text-body-sm font-medium text-ink-navy">
                      {entry.title}
                    </span>
                    <span className="text-caption text-slate-gray">
                      {entry.date}
                    </span>
                  </div>
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
    </div>
  );
}
