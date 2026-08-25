"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { useSchedules } from "@/hooks/useSchedules";
import type { ScheduleInput } from "@/lib/types";

export default function NewSchedulePage() {
  const router = useRouter();
  const { addSchedule } = useSchedules();

  const handleSubmit = (input: ScheduleInput) => {
    addSchedule(input);
    toast.success("일정이 등록되었습니다.");
    router.push("/calendar");
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-heading-sm font-bold text-ink-navy">일정 등록</h1>
      <div className="max-w-xl">
        <ScheduleForm submitLabel="일정 등록" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
