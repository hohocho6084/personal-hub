/**
 * 데이터 백업(Export/Import) 파일 검증용 zod 스키마
 * 근거: docs/tech-design.md 3-4절 (Export/Import 파일 포맷)
 */
import { z } from "zod";

const scheduleSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  time: z.string().nullable(),
  memo: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const moneyEntrySchema = z.object({
  id: z.string(),
  type: z.enum(["income", "expense"]),
  amount: z.number(),
  date: z.string(),
  title: z.string(),
  memo: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const backupDataSchema = z.object({
  schemaVersion: z.number(),
  exportedAt: z.string(),
  schedules: z.array(scheduleSchema),
  moneyEntries: z.array(moneyEntrySchema),
});
