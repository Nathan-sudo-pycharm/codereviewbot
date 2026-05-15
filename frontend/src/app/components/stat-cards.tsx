"use client";

interface StatCardsProps {
  stats?: {
    pr_count: number;
    review_count: number;
    findings_count: number;
  };
  loading?: boolean;
}

export function StatCards({ stats, loading }: StatCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 p-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-4 h-24 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Pull Requests",
      value: stats?.pr_count || 0,
      icon: "🔀",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Reviews",
      value: stats?.review_count || 0,
      icon: "📋",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Findings",
      value: stats?.findings_count || 0,
      icon: "🔍",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="group bg-card border border-border rounded-lg p-4 hover:border-accent hover:shadow-lg transition-all duration-200 cursor-default"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-accent mt-3">
                {card.value}
              </p>
            </div>
            <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
