"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MoneyEntryForm } from "@/components/money/money-entry-form";
import { useMoneyEntries } from "@/hooks/useMoneyEntries";
import type { MoneyEntryInput } from "@/lib/types";

function MoneyDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { entries, isLoaded, editMoneyEntry, removeMoneyEntry } =
    useMoneyEntries();
  const [isEditing, setIsEditing] = useState(false);

  const entry = entries.find((e) => e.id === id);

  const handleUpdate = (input: MoneyEntryInput) => {
    editMoneyEntry(id, input);
    toast.success("용돈 항목이 수정되었습니다.");
    setIsEditing(false);
  };

  const handleDelete = () => {
    removeMoneyEntry(id);
    toast.success("용돈 항목이 삭제되었습니다.");
    router.push("/money");
  };

  if (!isLoaded) {
    return <p className="text-body-sm text-slate-gray">불러오는 중...</p>;
  }

  if (!entry) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-heading-sm font-bold text-ink-navy">용돈 상세</h1>
        <p className="text-body-sm text-slate-gray">
          항목을 찾을 수 없습니다.
        </p>
        <Link href="/money" className="text-body-sm text-signal-blue hover:underline">
          용돈 기입장으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-sm font-bold text-ink-navy">용돈 상세</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-body-lg text-ink-navy">
            {!isEditing && (
              <Badge
                variant="secondary"
                className={
                  entry.type === "income"
                    ? "bg-income-green/10 text-income-green"
                    : "bg-expense-red/10 text-expense-red"
                }
              >
                {entry.type === "income" ? "수입" : "지출"}
              </Badge>
            )}
            {isEditing ? "용돈 항목 수정" : entry.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <MoneyEntryForm
              defaultValues={{
                type: entry.type,
                amount: String(entry.amount),
                date: entry.date,
                title: entry.title,
                memo: entry.memo,
              }}
              submitLabel="수정 완료"
              onSubmit={handleUpdate}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <dl className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-slate-gray">금액</dt>
                  <dd
                    className={
                      entry.type === "income"
                        ? "text-body-lg font-semibold text-income-green"
                        : "text-body-lg font-semibold text-expense-red"
                    }
                  >
                    {entry.type === "income" ? "+" : "-"}
                    {entry.amount.toLocaleString()}원
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-slate-gray">날짜</dt>
                  <dd className="text-body-sm text-ink-navy">{entry.date}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-slate-gray">메모</dt>
                  <dd className="whitespace-pre-wrap text-body-sm text-ink-navy">
                    {entry.memo || "메모 없음"}
                  </dd>
                </div>
              </dl>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4" />
                  수정
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="destructive" />}>
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>항목을 삭제할까요?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{entry.title}&quot; 항목을 삭제하면 되돌릴 수
                        없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function MoneyDetailPage() {
  return (
    <Suspense fallback={<p className="text-body-sm text-slate-gray">불러오는 중...</p>}>
      <MoneyDetailContent />
    </Suspense>
  );
}
