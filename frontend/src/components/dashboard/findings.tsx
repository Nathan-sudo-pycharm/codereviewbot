"use client";

import { useState } from "react";

interface Finding {
  file: string;
  line: number | null;
  severity: string;
  issue: string;
  suggestion: string;
}

interface FindingsProps {
  findings: Finding[];
}

const severityColors: Record<string, string> = {
  critical: "border-red-500",
  major: "border-orange-500",
  minor: "border-yellow-500",
  suggestion: "border-blue-500",
};

const severityBg: Record<string, string> = {
  critical: "bg-red-900 text-red-200",
  major: "bg-orange-900 text-orange-200",
  minor: "bg-yellow-900 text-yellow-200",
  suggestion: "bg-blue-900 text-blue-200",
};

export function Findings({ findings }: FindingsProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (findings.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Detailed Findings
        </h3>
        <div className="text-center py-12 text-muted-foreground">
          <p>✅ No findings for this review</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Detailed Findings ({findings.length})
      </h3>
      <div className="space-y-3">
        {findings.map((finding, idx) => (
          <div
            key={idx}
            className={`border-l-4 ${severityColors[finding.severity] || severityColors.suggestion} bg-card border border-border rounded-lg overflow-hidden`}
          >
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="w-full p-4 text-left hover:bg-secondary transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${severityBg[finding.severity]}`}
                    >
                      {finding.severity}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {finding.file}
                      {finding.line ? ` · line ${finding.line}` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{finding.issue}</p>
                </div>
                <div className="ml-4 text-muted-foreground">
                  {expandedIdx === idx ? "▼" : "▶"}
                </div>
              </div>
            </button>

            {expandedIdx === idx && (
              <div className="bg-secondary border-t border-border p-4">
                <p className="text-xs font-semibold text-accent mb-2 uppercase tracking-wide">
                  Suggestion
                </p>
                <p className="text-sm text-foreground font-mono bg-background p-3 rounded border border-border">
                  {finding.suggestion}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
