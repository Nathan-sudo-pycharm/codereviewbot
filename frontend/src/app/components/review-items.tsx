"use client";

interface Finding {
  file: string;
  line: number | null;
  severity: string;
  issue: string;
  suggestion: string;
}

interface ReviewItem {
  id: number;
  findings: Finding[];
  model: string;
  tokens_used: number;
  created_at: string;
}

interface ReviewItemsProps {
  reviews: ReviewItem[];
  loading?: boolean;
  selectedId?: number | null;
  onSelectReview?: (id: number) => void;
}

const severityColors: Record<
  string,
  { bg: string; text: string; badge: string }
> = {
  critical: {
    bg: "bg-red-950",
    text: "text-red-300",
    badge: "bg-red-900 text-red-200",
  },
  major: {
    bg: "bg-orange-950",
    text: "text-orange-300",
    badge: "bg-orange-900 text-orange-200",
  },
  minor: {
    bg: "bg-yellow-950",
    text: "text-yellow-300",
    badge: "bg-yellow-900 text-yellow-200",
  },
  suggestion: {
    bg: "bg-blue-950",
    text: "text-blue-300",
    badge: "bg-blue-900 text-blue-200",
  },
};

export function ReviewItems({
  reviews,
  loading,
  selectedId,
  onSelectReview,
}: ReviewItemsProps) {
  if (loading) {
    return (
      <div className="space-y-4 p-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-4 h-32 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No reviews found</p>
        </div>
      ) : (
        reviews.map((review) => {
          const hasIssues = review.findings?.length > 0;

          return (
            <div
              key={review.id}
              onClick={() => onSelectReview?.(review.id)}
              className={`bg-card border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                selectedId === review.id
                  ? "border-accent bg-secondary shadow-lg"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-foreground">
                      Review #{review.id}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {review.model} · {review.tokens_used} tokens
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                </div>
                {hasIssues ? (
                  <span className="bg-red-900 text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                    {review.findings.length} issues
                  </span>
                ) : (
                  <span className="bg-green-900 text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    ✅ Clean
                  </span>
                )}
              </div>

              {hasIssues && (
                <div className="space-y-2 mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    FINDINGS
                  </p>
                  {review.findings.slice(0, 3).map((finding, idx) => {
                    const colors =
                      severityColors[finding.severity] ||
                      severityColors.suggestion;
                    return (
                      <div
                        key={idx}
                        className={`flex gap-2 text-sm p-2 rounded ${colors.bg}`}
                      >
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${colors.badge}`}
                        >
                          {finding.severity}
                        </span>
                        <span className={colors.text}>{finding.issue}</span>
                      </div>
                    );
                  })}
                  {review.findings.length > 3 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{review.findings.length - 3} more issues
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
