"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ScheduleInput } from "@/lib/types";

type ScheduleFormValues = {
  title: string;
  date: string;
  time: string;
  memo: string;
};

type ScheduleFormErrors = Partial<Record<"title" | "date", string>>;

const EMPTY_VALUES: ScheduleFormValues = {
  title: "",
  date: "",
  time: "",
  memo: "",
};

export type ScheduleFormProps = {
  /** 수정 화면에서 기존 값으로 폼을 채울 때 사용 (작업 단위 6) */
  defaultValues?: Partial<ScheduleFormValues>;
  /** 저장 버튼 문구 */
  submitLabel?: string;
  /** 검증 통과 후 실제 저장을 수행하는 콜백 */
  onSubmit: (input: ScheduleInput) => void;
};

/**
 * 일정 등록/수정 공통 폼.
 * 필수 항목(제목, 날짜) 검증은 이 컴포넌트 안에서 처리한다 (sched-add-5).
 */
export function ScheduleForm({
  defaultValues,
  submitLabel = "저장",
  onSubmit,
}: ScheduleFormProps) {
  const [values, setValues] = useState<ScheduleFormValues>({
    ...EMPTY_VALUES,
    ...defaultValues,
  });
  const [errors, setErrors] = useState<ScheduleFormErrors>({});

  const handleChange =
    (field: keyof ScheduleFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: ScheduleFormErrors = {};
    if (!values.title.trim()) {
      nextErrors.title = "제목을 입력해주세요.";
    }
    if (!values.date) {
      nextErrors.date = "날짜를 선택해주세요.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      title: values.title.trim(),
      date: values.date,
      time: values.time || null,
      memo: values.memo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="schedule-title">제목</Label>
        <Input
          id="schedule-title"
          value={values.title}
          onChange={handleChange("title")}
          placeholder="예: 치과 예약"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && (
          <p className="text-caption text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="schedule-date">날짜</Label>
          <Input
            id="schedule-date"
            type="date"
            value={values.date}
            onChange={handleChange("date")}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && (
            <p className="text-caption text-destructive">{errors.date}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="schedule-time">시간 (선택)</Label>
          <Input
            id="schedule-time"
            type="time"
            value={values.time}
            onChange={handleChange("time")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="schedule-memo">메모 (선택)</Label>
        <Textarea
          id="schedule-memo"
          value={values.memo}
          onChange={handleChange("memo")}
          placeholder="메모를 입력하세요"
          rows={4}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
