"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

/**
 * 데이터 백업(Export/Import) 버튼 영역.
 *
 * 이번 단계(작업 단위 3, 대시보드)에서는 버튼 배치 자리만 마련한다
 * (dash-4: "백업 버튼 또는 메뉴가 노출된다"). 실제 내보내기/가져오기 로직은
 * 작업 단위 9(데이터 백업)에서 이 컴포넌트를 이어받아 구현한다
 * (docs/tech-design.md 6절).
 */
export function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportClick = () => {
    toast.info("데이터 백업(내보내기) 기능은 곧 추가될 예정입니다.");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = () => {
    toast.info("데이터 복원(가져오기) 기능은 곧 추가될 예정입니다.");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
    </div>
  );
}
