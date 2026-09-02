"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { useSchedules } from "@/hooks/useSchedules";
import type { ScheduleInput } from "@/lib/types";

function ScheduleDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { schedules, isLoaded, editSchedule, removeSchedule } = useSchedules();
  const [isEditing, setIsEditing] = useState(false);

  const schedule = schedules.find((s) => s.id === id);

  const handleUpdate = (input: ScheduleInput) => {
    editSchedule(id, input);
    toast.success("일정이 수정되었습니다.");
    setIsEditing(false);
  };

  const handleDelete = () => {
    removeSchedule(id);
    toast.success("일정이 삭제되었습니다.");
    router.push("/calendar");
  };

  if (!isLoaded) {
    return <p className="text-body-sm text-slate-gray">불러오는 중...</p>;
  }

  if (!schedule) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-heading-sm font-bold text-ink-navy">일정 상세</h1>
        <p className="text-body-sm text-slate-gray">
          일정을 찾을 수 없습니다.
        </p>
        <Link href="/calendar" className="text-body-sm text-signal-blue hover:underline">
          캘린더로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-sm font-bold text-ink-navy">일정 상세</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-body-lg text-ink-navy">
            {isEditing ? "일정 수정" : schedule.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <ScheduleForm
              defaultValues={{
                title: schedule.title,
                date: schedule.date,
                time: schedule.time ?? "",
                memo: schedule.memo,
              }}
              submitLabel="수정 완료"
              onSubmit={handleUpdate}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <dl className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-slate-gray">날짜</dt>
                  <dd className="text-body-sm text-ink-navy">{schedule.date}</dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-slate-gray">시간</dt>
                  <dd className="text-body-sm text-ink-navy">
                    {schedule.time ?? "설정 안 함"}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5">
                  <dt className="text-caption text-slate-gray">메모</dt>
                  <dd className="whitespace-pre-wrap text-body-sm text-ink-navy">
                    {schedule.memo || "메모 없음"}
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
                      <AlertDialogTitle>일정을 삭제할까요?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &quot;{schedule.title}&quot; 일정을 삭제하면 되돌릴 수
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

export default function ScheduleDetailPage() {
  return (
    <Suspense fallback={<p className="text-body-sm text-slate-gray">불러오는 중...</p>}>
      <ScheduleDetailContent />
    </Suspense>
  );
}
