"use client";

import { Button } from "@/components/ui/button";

interface AspectRatioSelectorProps {
  value: "1:1" | "4:5" | "1.91:1";
  onChange: (value: "1:1" | "4:5" | "1.91:1") => void;
}

const RATIOS = [
  { label: "1:1", value: "1:1" },
  { label: "4:5", value: "4:5" },
  { label: "1.91:1", value: "1.91:1" },
] as const;

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Aspect Ratio</h3>
      <div className="grid grid-cols-3 gap-2">
        {RATIOS.map((ratio) => (
          <Button
            key={ratio.value}
            variant={value === ratio.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(ratio.value)}
            className="text-xs font-medium"
          >
            {ratio.label}
          </Button>
        ))}
      </div>
    </div>
  );
} 