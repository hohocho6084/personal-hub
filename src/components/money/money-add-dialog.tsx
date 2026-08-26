"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoneyEntryForm } from "@/components/money/money-entry-form";
import { useMoneyEntries } from "@/hooks/useMoneyEntries";
import type { MoneyEntryInput } from "@/lib/types";

/** 용돈 목록 화면에 배치되는 "새 항목 추가" 모달 (money-list-2) */
export function MoneyAddDialog() {
  const [open, setOpen] = useState(false);
  const { addMoneyEntry } = useMoneyEntries();

  const handleSubmit = (input: MoneyEntryInput) => {
    addMoneyEntry(input);
    toast.success("용돈 항목이 등록되었습니다.");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" />
        새 항목 추가
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 수입/지출 항목</DialogTitle>
        </DialogHeader>
        <MoneyEntryForm submitLabel="등록" onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
