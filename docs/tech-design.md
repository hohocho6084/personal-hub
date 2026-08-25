# 개인 허브 (personal-hub) 기술 설계 문서

> 근거 문서: `hub-goal.md`, `feature-checklist.json`(8개 카테고리 38개 항목), `requirements.md`, `Design.md` (모두 사용자 컨펌 완료)
> 작성자: 개발팀장(dev-lead) · 이 문서는 기획팀장과의 별도 조정 논의 없이 작성되었습니다 — 사유는 "0. 문서 작성 경위" 참고.

---

## 0. 문서 작성 경위 (기획팀장 재논의 여부에 대한 판단)

이번 프로젝트는 1인 개인용 프로젝트로 시장조사/우선순위산정 단계를 생략하고 요구사항정의서 다음 바로
기술 설계 단계로 넘어왔습니다. `requirements.md` 7절에 이미 "기술 스택 최종 확정은 개발팀장(dev-lead)의
기술 설계 단계에서 이루어진다"고 명시되어 있고, 8절(디자인 참고사항)도 "실제 톤앤매너 적용은 이후
구현 단계 몫"이라고 범위를 개발팀장에게 넘겨둔 상태입니다.

검토 결과, 이번 MVP는 서버/DB 없는 순수 프론트엔드 CRUD(생성·조회·수정·삭제) 앱으로 기능적으로
복잡한 리스크(실시간 처리, AI/STT 파이프라인 등)가 없고, 조정이 필요한 지점은 모두 "기술 스택
선택", "구현 방식", "라이브러리 선택" 수준(캘린더 날짜 계산, JSON 검증 등)입니다. 이는 CEO 지시서의
4대 범위(타겟 사용자/핵심 기능 우선순위/예산·일정/톤&방향성)를 벗어나지 않고, `requirements.md`에서도
이미 개발팀장 권한으로 위임된 사안이므로, 기획팀장과 별도로 논의하지 않고 이 문서에서 바로 기술
판단을 확정합니다. (기능 추가/삭제, 화면 추가 등 기획 범위를 건드리는 판단은 전혀 없었습니다.)

---

## 1. 기술 스택 확정

### 1-1. 최종 결정

| 영역 | 선택 |
|---|---|
| 프레임워크 | **Next.js (App Router, TypeScript)** |
| UI 컴포넌트 | shadcn/ui (Radix 기반, Tailwind CSS) |
| 스타일링 | Tailwind CSS (Design.md 토큰을 CSS 변수/Tailwind 테마로 반영) |
| 상태 관리 | React 기본 상태(useState/useEffect) + 커스텀 훅. 별도 전역 상태 라이브러리 불필요 |
| 데이터 저장 | 브라우저 localStorage (서버/DB 없음) |
| 날짜 처리 | date-fns (월간 달력 계산, 날짜 포맷) |
| 데이터 검증 | zod (가져오기 JSON 파일의 스키마 검증) |
| 아이콘 | lucide-react (shadcn 기본 아이콘 세트) |
| 배포/실행 | 로컬 실행(`npm run dev`) 또는 Vercel 등 정적/Node 호스팅. 서버 API를 쓰지 않으므로 정적 호스팅도 가능 |
| 인프라(Docker 등) | **사용하지 않음** — 백엔드 서버·DB가 없는 프론트엔드 단독 프로젝트이므로 불필요한 인프라 복잡도를 추가하지 않음 |

### 1-2. Next.js 채택 근거

`requirements.md`는 "2단계에 구글 캘린더/지메일 연동이 예정되어 있어 Next.js가 검토되고 있다"고
기록했고, 최종 확정은 이 단계의 몫이라 명시했습니다. 아래 기준으로 검토한 결과 Next.js를 최종
채택합니다.

**검토한 대안**

| 대안 | 장점 | 단점 |
|---|---|---|
| **Next.js (App Router)** | shadcn 공식 지원 기준 프레임워크. 2단계 구글 OAuth 연동 시 API Route/Server Action으로 클라이언트 시크릿을 안전하게 처리 가능(별도 백엔드 신설 불필요). 파일 기반 라우팅으로 6개 화면 구조를 그대로 매핑 가능 | 순수 정적 앱치고는 프레임워크가 다소 무거움. App Router 학습 곡선 존재 |
| Vite + React (SPA) | 세팅이 가볍고 빠름. 1단계 목적만 보면 충분 | 2단계에서 구글 OAuth 토큰 교환을 하려면 클라이언트 시크릿을 브라우저에 노출할 수 없어 별도 백엔드(Express 등)를 새로 세워야 함 → 2단계에서 아키텍처 전면 교체 필요 |
| 순수 정적 HTML/JS | 가장 가벼움 | shadcn(React 전용 컴포넌트)을 못 씀. 2단계 확장 시 처음부터 재작성 필요 |

**결론**: (1) shadcn이 React 기반이라 이미 React 계열 프레임워크가 필요하고, (2) 2단계에서 예정된
구글 캘린더/지메일 OAuth 연동은 보안상 서버 사이드 처리(토큰 교환)가 필요한데 Next.js는 API
Route/Server Action으로 이를 같은 프로젝트 안에서 자연스럽게 확장할 수 있습니다. Vite SPA로
시작하면 1단계는 더 가볍지만 2단계에서 백엔드를 통째로 새로 만들어야 하는 마이그레이션 비용이
발생합니다. 따라서 **1단계 지금은 서버 기능을 전혀 쓰지 않고 클라이언트 컴포넌트("use client")로만
구성하되, 뼈대는 Next.js로 잡아 2단계 확장 여지를 남겨두는 것**이 합리적이라고 판단했습니다.

과잉설계(오버엔지니어링) 우려에 대한 대응: 1단계에서는 Next.js의 서버 기능(API Route, Server
Action, 서버 컴포넌트의 서버 사이드 데이터 페칭)을 전혀 사용하지 않습니다. 모든 페이지를 클라이언트
컴포넌트로 작성하고 데이터는 전부 브라우저 localStorage에서 읽고 씁니다. 즉 지금 단계에서는
"파일 기반 라우팅 + React 프레임워크"로만 사용하고, 서버 기능은 2단계에 실제로 필요해질 때
추가하는 방식입니다.

---

## 2. 아키텍처 개요

### 2-1. 구성 요소

```
[브라우저]
  ┌─────────────────────────────────────────────┐
  │  Next.js App (클라이언트 컴포넌트만 사용)        │
  │                                               │
  │  UI 컴포넌트 (shadcn/ui + 화면별 컴포넌트)        │
  │            │                                  │
  │            ▼                                  │
  │  커스텀 훅 (useSchedules, useMoneyEntries)      │
  │            │                                  │
  │            ▼                                  │
  │  lib/storage.ts (localStorage CRUD 유틸)        │
  │            │                                  │
  │            ▼                                  │
  │  브라우저 localStorage                          │
  └─────────────────────────────────────────────┘

서버 없음 / 외부 API 호출 없음 (1단계 범위)
```

데이터는 UI → 커스텀 훅 → storage 유틸 → localStorage 순으로만 흐르며, 브라우저 밖으로 전송되는
지점이 없습니다(비기능 요구사항 "인증/보안", "가용성" 충족).

### 2-2. 폴더 구조 (제안)

```
personal-hub/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 공통 레이아웃 + 상단 네비게이션 (common-3)
│   │   ├── page.tsx                # 대시보드 (/)
│   │   ├── schedule/
│   │   │   ├── new/page.tsx        # 일정 등록 (/schedule/new)
│   │   │   └── [id]/page.tsx       # 일정 상세 (/schedule/:id)
│   │   ├── calendar/page.tsx       # 캘린더 월간 뷰 (/calendar)
│   │   └── money/
│   │       ├── page.tsx            # 용돈 목록 (/money)
│   │       └── [id]/page.tsx       # 용돈 상세 (/money/:id)
│   ├── components/
│   │   ├── ui/                     # shadcn 생성 컴포넌트 (button, dialog, input 등)
│   │   ├── layout/Nav.tsx
│   │   ├── schedule/                # ScheduleForm, ScheduleCard 등
│   │   ├── money/                   # MoneyForm(다이얼로그), MoneyRow 등
│   │   └── backup/BackupControls.tsx # Export/Import 버튼 (대시보드에 배치)
│   ├── lib/
│   │   ├── types.ts                 # Schedule, MoneyEntry 타입
│   │   ├── storage.ts               # localStorage get/set/CRUD
│   │   └── validation.ts            # zod 스키마 (백업 파일 검증)
│   └── hooks/
│       ├── useSchedules.ts
│       └── useMoneyEntries.ts
└── (설정 파일: next.config, tailwind.config, components.json 등)
```

용돈 항목 "추가"(money-list-2)는 별도 화면이 아니라 shadcn Dialog(모달)로 용돈 목록 화면 안에서
처리합니다 — hub-goal.md의 6개 화면 정의에 "용돈 등록"이 독립 화면으로 명시되어 있지 않기 때문입니다.

---

## 3. 데이터 모델 및 localStorage 설계

### 3-1. 일정 (Schedule)

```ts
type Schedule = {
  id: string;          // crypto.randomUUID()
  title: string;       // 필수
  date: string;        // "YYYY-MM-DD" 필수, 타임존 문제 방지를 위해 Date 객체 대신 문자열로 저장
  time: string | null; // "HH:mm" 선택 입력
  memo: string;        // 선택 입력, 기본값 ""
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
};
```

### 3-2. 용돈 항목 (MoneyEntry)

```ts
type MoneyEntry = {
  id: string;                  // crypto.randomUUID()
  type: "income" | "expense";  // 필수, 수입/지출 구분 (money-list-3)
  amount: number;               // 필수, 0보다 큰 정수(원 단위)
  date: string;                 // "YYYY-MM-DD" 필수
  title: string;                // 항목명, 필수
  memo: string;                 // 선택 입력, 기본값 ""
  createdAt: string;
  updatedAt: string;
};
```

### 3-3. localStorage 키 구조

| 키 | 내용 |
|---|---|
| `personal-hub:schedules` | `Schedule[]` JSON 배열 |
| `personal-hub:money-entries` | `MoneyEntry[]` JSON 배열 |
| `personal-hub:meta` | `{ schemaVersion: 1 }` — 추후 데이터 구조 변경 시 마이그레이션 판단용 |

### 3-4. Export/Import 파일 포맷

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-08-25T12:00:00.000Z",
  "schedules": [ /* Schedule[] */ ],
  "moneyEntries": [ /* MoneyEntry[] */ ]
}
```

- Export: 위 3개 localStorage 키 값을 하나의 JSON으로 합쳐 `Blob` + `URL.createObjectURL`로 다운로드.
- Import: 업로드된 파일을 `JSON.parse` 후 zod 스키마로 구조 검증(backup-4) → 문제 없으면 확인
  팝업(backup-3, "기존 데이터를 덮어씁니다") → 승인 시 3개 키를 통째로 교체.
- 검증 실패(JSON 파싱 실패, 스키마 불일치) 시 toast/alert로 오류 안내(backup-4).

---

## 4. 화면/기능별 구현 난이도·리스크 및 대응

| 화면/기능 | 난이도 | 리스크 | 대응 방안 |
|---|---|---|---|
| 대시보드 | 낮음 | 오늘 일정/최근 용돈 필터링 로직이 여러 화면에서 중복될 수 있음 | `useSchedules`/`useMoneyEntries` 훅에 `getTodaySchedules()`, `getRecentEntries()` 같은 selector 함수를 두어 재사용 |
| 일정 등록 | 낮음 | 필수값(제목/날짜) 검증 누락 | react-hook-form 또는 간단한 controlled form + 인라인 에러 메시지(sched-add-5) |
| 캘린더 월간 뷰 | **중간** | 월 경계 계산·요일 정렬·"일정 있는 날짜 마커" 매칭 시 타임존/날짜 문자열 비교 버그 발생 가능 | 모든 날짜를 `Date` 객체가 아닌 `"YYYY-MM-DD"` 문자열로 저장·비교(3-1/3-2 참고)하고, 달력 그리드 생성은 date-fns(`startOfMonth`, `eachDayOfInterval` 등)로 검증된 라이브러리에 위임 |
| 일정 상세(수정/삭제) | 낮음 | 삭제 시 실수로 데이터 유실 | shadcn AlertDialog로 삭제 확인 팝업(sched-detail-4) |
| 용돈 목록 | 낮음~중간 | 목록이 길어질 경우 정렬/구분 UI 복잡도 | 기본 정렬은 날짜 내림차순, 수입/지출은 색상+아이콘(예: 초록/빨강, +/- 표기)으로 구분(money-list-3) |
| 용돈 상세(수정/삭제) | 낮음 | 일정 상세와 동일한 삭제 확인 패턴 필요 | 일정 상세와 동일한 AlertDialog 컴포넌트 재사용 |
| 데이터 백업(Export/Import) | **중간** | 잘못된 형식의 파일 업로드 시 크래시 또는 데이터 오염 위험 | zod 스키마 검증 + try/catch로 파싱 실패 처리, 검증 실패 시 기존 localStorage는 절대 건드리지 않고 오류만 표시 |
| 공통(네비게이션/영속성) | 낮음 | localStorage 접근이 서버 사이드 렌더링(SSR) 중 실행되면 `window is not defined` 에러 발생 가능(Next.js 특유 이슈) | storage 접근 코드는 전부 `"use client"` 컴포넌트 안, `useEffect` 내부에서만 실행 |

**참고(향후 확장 시 유의점, 이번 범위 아님)**: 여러 브라우저 탭을 동시에 열어두고 각각 수정하면
마지막에 저장한 탭의 내용만 남는 이슈가 있을 수 있습니다. 1인 개인용 도구라 우선순위는 낮지만,
필요하면 `window`의 `storage` 이벤트를 구독해 탭 간 동기화를 추가할 수 있습니다(1단계 필수 아님).

---

## 5. shadcn 도입 방식 및 Design.md 반영 전략

1. **세팅 순서**: `create-next-app`(TypeScript, Tailwind, App Router 옵션 활성화) → `npx shadcn@latest init`
   → 필요한 컴포넌트(`button`, `input`, `dialog`, `alert-dialog`, `card`, `badge`, `calendar`,
   `sonner`(toast) 등)를 `npx shadcn@latest add`로 추가.
2. **Design.md 토큰 반영**: Design.md는 Tailwind v4 `@theme` 블록과 CSS 커스텀 프로퍼티를 이미
   제공하고 있으므로, `globals.css`의 `@theme`에 해당 색상(`--color-ink-navy` 등)·타이포(`--text-*`)·
   spacing(`--spacing-*`)·라운드(`--radius-*`) 토큰을 그대로 이식합니다. shadcn의 기본 테마 변수
   (`--background`, `--primary` 등)를 Design.md 토큰에 매핑(예: `--primary` → Signal Blue `#006bff`,
   `--foreground` → Ink Navy `#0b3558`, `--radius` → 8px 버튼 기준)해서 shadcn 컴포넌트가 기본값부터
   Design.md 톤을 따르도록 합니다.
3. **적용 범위**: 이 문서에서는 "기술적으로 어떻게 연결할지"만 정하며, 실제 픽셀 단위 배치·카피·
   구체적 스타일링은 구현 단계(fullstack-dev)에서 화면별로 진행합니다.

---

## 6. 작업 분배 (fullstack-dev 전달용, 9개 단위)

`feature-checklist.json` 38개 항목을 아래 9개 구현 단위로 분배합니다. 각 단위는 독립적으로
브랜치를 따서 구현·셀프테스트·QA·머지가 가능한 크기로 나눴습니다.

| # | 작업 단위 | 포함 기능 (feature-checklist ID) |
|---|---|---|
| 1 | 프로젝트 초기 세팅 | Next.js+TypeScript+Tailwind+shadcn 설치, 공통 레이아웃/네비게이션, 라우팅 뼈대, Design.md 토큰 반영. common-1(로그인 없음은 자연히 충족), common-3(화면 간 이동) |
| 2 | 데이터 모델 & localStorage 유틸 | Schedule/MoneyEntry 타입, storage.ts CRUD 함수, useSchedules/useMoneyEntries 훅. common-2, common-4 |
| 3 | 대시보드 화면 | dash-1, dash-2, dash-3, dash-4(백업 버튼 배치 자리만, 실제 백업 로직은 9번) |
| 4 | 일정 등록 폼 | sched-add-1, sched-add-2, sched-add-3, sched-add-4, sched-add-5, sched-add-6 |
| 5 | 캘린더 월간 뷰 | cal-1, cal-2, cal-3, cal-4, cal-5 |
| 6 | 일정 상세(수정/삭제) | sched-detail-1, sched-detail-2, sched-detail-3, sched-detail-4 |
| 7 | 용돈 목록(+등록 모달) | money-list-1, money-list-2, money-list-3, money-list-4 |
| 8 | 용돈 상세(수정/삭제) | money-detail-1, money-detail-2, money-detail-3, money-detail-4 |
| 9 | 데이터 백업 (Export/Import) | backup-1, backup-2, backup-3, backup-4, backup-5 (+ 대시보드 dash-4의 버튼과 실제 연결) |

권장 구현 순서: 1 → 2 → (3, 4, 5, 6, 7, 8 순서는 서로 대체로 독립적이나 캘린더가 일정 등록/상세에
의존하므로 4·6을 먼저 끝낸 뒤 5 진행 권장) → 9(백업은 다른 모든 데이터 구조가 확정된 뒤 마지막에
진행하는 것이 안전).

---

## 7. 성공 기준(hub-goal.md 6절) 매핑 확인

요구사항정의서의 9개 성공 기준은 위 9개 작업 단위 + 아키텍처(서버 없음, localStorage 영속성)로
모두 커버됩니다. 별도로 빠지는 항목은 없습니다.

---

## 8. 컨펌 필요 여부 판단

이번 기술 설계 과정에서 타겟 사용자 범위, 핵심 기능 우선순위/존재, 예산·일정, 서비스 톤/방향성
(4대 범위) 중 어느 것도 변경되지 않았습니다. Next.js 채택, 데이터 모델 설계, 작업 분배는 모두
`requirements.md`에서 이미 개발팀장 권한으로 위임된 기술 구현 판단이라 CEO 확인 없이 이 문서에서
확정합니다. 기획팀장과의 별도 협의도 필요하지 않았습니다(0절 참고).
