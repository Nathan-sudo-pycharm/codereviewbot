"use client";

interface HeaderProps {
  repoName?: string;
}

export function Header({ repoName }: HeaderProps) {
  return (
    <div className="border-b border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">
            {repoName ? `${repoName}` : "Select a Repository"}
          </h2>
          {repoName && (
            <p className="text-xl text-muted-foreground mt-1">
              Code review analysis and insights
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
