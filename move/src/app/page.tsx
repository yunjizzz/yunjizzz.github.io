"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [date, setDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (date) {
      router.push(`/checklist?date=${date}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <span className="text-5xl block">📦</span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            이사 준비,<br />체크리스트로 한눈에
          </h1>
          <p className="text-muted-foreground">
            이사 날짜를 입력하면 맞춤 체크리스트를 제공해 드립니다
          </p>
        </div>

        {/* Date Input Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">이사 날짜 설정</CardTitle>
            <CardDescription>이사 예정일을 선택해 주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button type="submit" disabled={!date} className="w-full h-12 text-base font-semibold">
                체크리스트 시작하기
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: "D-30", desc: "사전 준비" },
            { label: "D-7", desc: "본격 준비" },
            { label: "D-Day", desc: "이사 당일" },
          ].map((step) => (
            <Card key={step.label} className="py-4">
              <CardContent className="p-0 flex flex-col items-center gap-1">
                <span className="text-xl font-extrabold text-primary">{step.label}</span>
                <span className="text-xs text-muted-foreground">{step.desc}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
