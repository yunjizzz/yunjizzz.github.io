"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateChecklist, getSections, getProgress, toggleItem, getDaysUntilMove } from "@/lib/checklist";
import { loadChecklist, saveChecklist } from "@/lib/storage";
import { UserChecklist } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

function getPriorityBadge(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return <Badge variant="destructive">필수</Badge>;
  }
  if (priority === "medium") {
    return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">권장</Badge>;
  }
  return <Badge variant="secondary">선택</Badge>;
}

function ChecklistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");

  const [checklist, setChecklist] = useState<UserChecklist | null>(() => {
    if (!dateParam) return null;
    const moveDate = new Date(dateParam);
    if (isNaN(moveDate.getTime())) return null;
    const stored = loadChecklist();
    if (stored && stored.moveDate.startsWith(dateParam)) return stored;
    const cl = generateChecklist(moveDate);
    saveChecklist(cl);
    return cl;
  });

  const sections = checklist ? getSections(checklist) : [];

  const [collapsedSections, setCollapsedSections] = useState<Set<number>>(() => {
    if (!checklist) return new Set();
    const generatedSections = getSections(checklist);
    const daysLeft = getDaysUntilMove(checklist.moveDate);
    return new Set(
      generatedSections
        .filter((s) => -s.daysBeforeMove > daysLeft)
        .map((s) => s.daysBeforeMove)
    );
  });

  useEffect(() => {
    if (!dateParam) {
      router.replace("/");
    }
  }, [dateParam, router]);

  const handleToggle = (templateId: string) => {
    if (!checklist) return;
    const updated = toggleItem(checklist, templateId);
    saveChecklist(updated);
    setChecklist(updated);
  };

  const toggleSection = (daysBeforeMove: number) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(daysBeforeMove)) {
        next.delete(daysBeforeMove);
      } else {
        next.add(daysBeforeMove);
      }
      return next;
    });
  };

  if (!checklist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  const progress = getProgress(checklist);
  const daysUntilMove = getDaysUntilMove(checklist.moveDate);
  const isAllDone = progress.percent === 100;

  const moveDateFormatted = new Date(checklist.moveDate).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header + Progress */}
      <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 shadow-lg">
        <p className="text-blue-200 text-sm">이사일: {moveDateFormatted}</p>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-4xl font-extrabold tracking-tight">
            {daysUntilMove > 0
              ? `D-${daysUntilMove}`
              : daysUntilMove < 0
              ? `D+${Math.abs(daysUntilMove)}`
              : "D-Day"}
          </span>
          <span className="text-blue-100 text-sm">
            {daysUntilMove > 0
              ? `이사까지 ${daysUntilMove}일 남았어요`
              : daysUntilMove === 0
              ? "오늘이 이사일이에요!"
              : `이사한 지 ${Math.abs(daysUntilMove)}일이 지났어요`}
          </span>
        </div>
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-blue-200">전체 진행률</span>
            <span className="font-semibold">
              {progress.completed}/{progress.total} ({progress.percent}%)
            </span>
          </div>
          <div className="w-full bg-blue-900/40 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Celebration banner */}
      {isAllDone && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
          <p className="text-green-800 font-semibold text-lg">모든 항목을 완료했어요!</p>
          <p className="text-green-700 text-sm mt-1">완벽한 이사 준비 완료! 새 집에서 행복하세요.</p>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isCollapsed = collapsedSections.has(section.daysBeforeMove);
          const sectionCompleted = section.items.filter((i) => i.checked).length;
          const sectionTotal = section.items.length;

          return (
            <Card key={section.daysBeforeMove} className="overflow-hidden border-0 shadow-md">
              <CardHeader
                className={`cursor-pointer select-none py-4 ${
                  sectionCompleted === sectionTotal
                    ? "bg-green-50"
                    : "bg-slate-50"
                }`}
                onClick={() => toggleSection(section.daysBeforeMove)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-blue-700">
                      {section.label.split(" | ")[0]}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {section.label.split(" | ")[1]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      sectionCompleted === sectionTotal
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {sectionCompleted}/{sectionTotal}
                    </span>
                    <span className="text-muted-foreground text-sm">{isCollapsed ? "▶" : "▼"}</span>
                  </div>
                </div>
              </CardHeader>

              {!isCollapsed && (
                <CardContent className="p-0 divide-y">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                        item.checked
                          ? "bg-slate-50/60"
                          : item.priority === "high"
                          ? "hover:bg-red-50/40"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={() => handleToggle(item.id)}
                        className="mt-1 h-5 w-5"
                      />
                      <label
                        htmlFor={item.id}
                        className={`flex-1 cursor-pointer space-y-1 ${
                          item.checked ? "opacity-40" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[15px] font-semibold ${
                              item.checked ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {item.title}
                          </span>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                      </label>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Bottom link */}
      <div className="pt-4 text-center">
        <Link
          href="/vendors"
          className={buttonVariants({ className: "bg-blue-600 hover:bg-blue-700 text-white" })}
        >
          업체 정보 보기
        </Link>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><p className="text-muted-foreground">로딩 중...</p></div>}>
      <ChecklistContent />
    </Suspense>
  );
}
