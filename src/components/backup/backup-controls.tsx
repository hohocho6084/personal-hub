"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getMoneyEntries,
  getSchedules,
  replaceMoneyEntries,
  replaceSchedules,
  SCHEMA_VERSION,
} from "@/lib/storage";
import { backupDataSchema } from "@/lib/validation";
import type { BackupData } from "@/lib/types";

/**
 * 데이터 백업(Export/Import) 버튼 영역.
 * - 내보내기(backup-1): 전체 일정·용돈 데이터를 JSON 파일로 다운로드
 * - 가져오기(backup-2~5): JSON 파일 업로드 -> zod 스키마 검증 -> 덮어쓰기 확인
 *   팝업 -> 승인 시 localStorage 전체 교체
 */
export function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<BackupData | null>(null);

  const handleExportClick = () => {
    const data: BackupData = {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      schedules: getSchedules(),
      moneyEntries: getMoneyEntries(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `personal-hub-backup-${format(
      new Date(),
      "yyyyMMdd-HHmmss"
    )}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("데이터를 내보냈습니다.");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    let json: unknown;
    try {
      json = JSON.parse(await file.text());
    } catch {
      toast.error("파일을 읽을 수 없습니다. 올바른 JSON 파일인지 확인해주세요.");
      return;
    }

    const result = backupDataSchema.safeParse(json);
    if (!result.success) {
      toast.error(
        "파일 형식이 올바르지 않습니다. personal-hub에서 내보낸 백업 파일인지 확인해주세요."
      );
      return;
    }

    // 검증 통과 -> 덮어쓰기 확인 팝업 표시 (backup-3)
    setPendingImport(result.data);
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    replaceSchedules(pendingImport.schedules);
    replaceMoneyEntries(pendingImport.moneyEntries);
    toast.success("데이터를 복원했습니다.");
    setPendingImport(null);
    // 대시보드/캘린더/용돈 목록 등 여러 화면이 각자 훅으로 localStorage를 읽고
    // 있어서, 복원된 데이터를 모든 화면에 안전하게 반영하기 위해 새로고침한다.
    window.location.reload();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleExportClick}>
        <Download className="h-4 w-4" />
        내보내기
      </Button>
      <Button variant="outline" size="sm" onClick={handleImportClick}>
        <Upload className="h-4 w-4" />
        가져오기
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileSelected}
      />

      <AlertDialog
        open={pendingImport !== null}
        onOpenChange={(open) => {
          if (!open) setPendingImport(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기존 데이터를 덮어쓸까요?</AlertDialogTitle>
            <AlertDialogDescription>
              가져오기를 진행하면 현재 저장된 모든 일정·용돈 데이터가 파일의
              내용으로 교체되며, 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              덮어쓰기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
