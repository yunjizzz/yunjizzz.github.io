import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이사 체크리스트",
  description: "이사 D-30부터 D+7까지 시점별 체크리스트. 필수, 권장 항목을 한눈에 확인하고 체크하세요.",
};

export default function ChecklistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
