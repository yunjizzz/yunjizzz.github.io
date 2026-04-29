import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이사 업체 모음",
  description: "이사업체, 청소, 인테리어, 관공서 등 이사에 필요한 업체 링크를 카테고리별로 모았습니다.",
};

export default function VendorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
