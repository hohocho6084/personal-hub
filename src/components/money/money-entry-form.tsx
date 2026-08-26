"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { MoneyEntryInput, MoneyEntryType } from "@/lib/types";

type MoneyEntryFormValues = {
  type: MoneyEntryType;
  amount: string;
  date: string;
  title: string;
  memo: string;
};

type MoneyEntryFormErrors = Partial<
  Record<"amount" | "date" | "title", string>
>;

const EMPTY_VALUES: MoneyEntryFormValues = {
  type: "expense",
  amount: "",
  date: "",
  title: "",
  memo: "",
};

export type MoneyEntryFormProps = {
  /** 수정 화면에서 기존 값으로 폼을 채울 때 사용 (작업 단위 8) */
  defaultValues?: Partial<MoneyEntryFormValues>;
  submitLabel?: string;
  onSubmit: (input: MoneyEntryInput) => void;
};

/**
 * 용돈(수입/지출) 항목 등록/수정 공통 폼.
 * 필수 항목(금액/날짜/항목명) 검증을 이 컴포넌트 안에서 처리한다.
 */
export function MoneyEntryForm({
  defaultValues,
  submitLabel = "저장",
  onSubmit,
}: MoneyEntryFormProps) {
  const [values, setValues] = useState<MoneyEntryFormValues>({
    ...EMPTY_VALUES,
    ...defaultValues,
  });
  const [errors, setErrors] = useState<MoneyEntryFormErrors>({});

  const handleChange =
    (field: "amount" | "date" | "title" | "memo") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: MoneyEntryFormErrors = {};
    const amountNumber = Number(values.amount);
    if (!values.title.trim()) {
      nextErrors.title = "항목명을 입력해주세요.";
    }
    if (!values.date) {
      nextErrors.date = "날짜를 선택해주세요.";
    }
    if (!values.amount || !Number.isInteger(amountNumber) || amountNumber <= 0) {
      nextErrors.amount = "0보다 큰 금액을 입력해주세요.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({
      type: values.type,
      amount: amountNumber,
      date: values.date,
      title: values.title.trim(),
      memo: values.memo,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label>수입/지출</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={values.type === "income" ? "default" : "outline"}
            className={cn(
              values.type === "income" && "bg-income-green hover:bg-income-green/80"
            )}
            onClick={() => setValues((prev) => ({ ...prev, type: "income" }))}
          >
            수입
          </Button>
          <Button
            type="button"
            size="sm"
            variant={values.type === "expense" ? "default" : "outline"}
            className={cn(
              values.type === "expense" && "bg-expense-red hover:bg-expense-red/80"
            )}
            onClick={() => setValues((prev) => ({ ...prev, type: "expense" }))}
          >
            지출
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="money-title">항목명</Label>
        <Input
          id="money-title"
          value={values.title}
          onChange={handleChange("title")}
          placeholder="예: 용돈, 점심 식사"
          aria-invalid={Boolean(errors.title)}
        />
        {errors.title && (
          <p className="text-caption text-destructive">{errors.title}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="money-amount">금액 (원)</Label>
          <Input
            id="money-amount"
            type="number"
            min={1}
            step={1}
            value={values.amount}
            onChange={handleChange("amount")}
            placeholder="예: 10000"
            aria-invalid={Boolean(errors.amount)}
          />
          {errors.amount && (
            <p className="text-caption text-destructive">{errors.amount}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="money-date">날짜</Label>
          <Input
            id="money-date"
            type="date"
            value={values.date}
            onChange={handleChange("date")}
            aria-invalid={Boolean(errors.date)}
          />
          {errors.date && (
            <p className="text-caption text-destructive">{errors.date}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="money-memo">메모 (선택)</Label>
        <Textarea
          id="money-memo"
          value={values.memo}
          onChange={handleChange("memo")}
          placeholder="메모를 입력하세요"
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
