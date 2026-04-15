"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { vendors, vendorCategories } from "@/data/vendors";
import { Vendor } from "@/types";

const categoryIcons: Record<string, string> = {
  이사업체: "🚛",
  청소: "🧹",
  인테리어: "🏠",
  관공서: "🏢",
  기타: "📌",
};

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <a
      href={vendor.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <Card className="flex flex-col h-full border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold group-hover:text-blue-600 transition-colors">{vendor.name}</CardTitle>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 flex-1">
          <p className="text-sm text-muted-foreground flex-1 leading-relaxed">{vendor.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {vendor.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState<string>("이사업체");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">업체 링크</h1>
        <p className="text-muted-foreground mt-1">이사할 때 필요한 업체와 서비스를 모아봤어요</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full !h-auto flex-wrap gap-1.5 p-2 mb-6 rounded-xl">
          {vendorCategories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="flex-1 !h-auto px-5 py-3 text-sm font-medium rounded-lg"
            >
              <span className="mr-1">{categoryIcons[category]}</span>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {vendorCategories.map((category) => {
          const filtered = vendors.filter((v) => v.category === category);
          return (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
