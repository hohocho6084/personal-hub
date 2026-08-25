/**
 * personal-hub 데이터 모델 정의
 * 근거: docs/tech-design.md 3절
 */

/** 일정 */
export type Schedule = {
  id: string; // crypto.randomUUID()
  title: string; // 필수
  date: string; // "YYYY-MM-DD" 필수 (타임존 문제 방지를 위해 문자열로 저장)
  time: string | null; // "HH:mm" 선택 입력
  memo: string; // 선택 입력, 기본값 ""
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
};

/** 일정 생성/수정 시 사용자가 입력하는 값 (id/생성·수정시각 제외) */
export type ScheduleInput = Omit<Schedule, "id" | "createdAt" | "updatedAt">;

/** 용돈 항목 수입/지출 구분 */
export type MoneyEntryType = "income" | "expense";

/** 용돈(수입/지출) 항목 */
export type MoneyEntry = {
  id: string; // crypto.randomUUID()
  type: MoneyEntryType; // 필수
  amount: number; // 필수, 0보다 큰 정수(원 단위)
  date: string; // "YYYY-MM-DD" 필수
  title: string; // 항목명, 필수
  memo: string; // 선택 입력, 기본값 ""
  createdAt: string;
  updatedAt: string;
};

/** 용돈 항목 생성/수정 시 사용자가 입력하는 값 */
export type MoneyEntryInput = Omit<MoneyEntry, "id" | "createdAt" | "updatedAt">;

/** localStorage "personal-hub:meta" 키에 저장되는 메타 정보 */
export type Meta = {
  schemaVersion: number;
};

/** Export/Import 백업 파일 포맷 (docs/tech-design.md 3-4) */
export type BackupData = {
  schemaVersion: number;
  exportedAt: string;
  schedules: Schedule[];
  moneyEntries: MoneyEntry[];
};
