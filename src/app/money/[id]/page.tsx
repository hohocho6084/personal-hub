export default async function MoneyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-heading-sm font-bold text-ink-navy">용돈 상세</h1>
      <p className="text-slate-gray">
        용돈 항목(id: {id}) 상세/수정/삭제 화면이 이곳에 표시될 예정입니다.
        (구현 예정: 작업 단위 8)
      </p>
    </div>
  );
}
