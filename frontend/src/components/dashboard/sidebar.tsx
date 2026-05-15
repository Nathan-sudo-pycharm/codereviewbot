"use client";

import { Dispatch, SetStateAction } from "react";

interface Repository {
  id: number;
  repo: string;
  created_at: string;
}

interface SidebarProps {
  repositories: Repository[];
  selectedRepo: number | null;
  onSelectRepo: Dispatch<SetStateAction<number | null>>;
  loading: boolean;
}

export function Sidebar({
  repositories,
  selectedRepo,
  onSelectRepo,
  loading,
}: SidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-accent">CodeReviewBot</h1>
        <p className="text-sm text-muted-foreground mt-1">Review Dashboard</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 px-2">
            Repositories
          </h2>
          <div className="space-y-2">
            {loading ? (
              <div className="text-sm text-muted-foreground px-2">
                Loading repositories...
              </div>
            ) : repositories.length === 0 ? (
              <div className="text-sm text-muted-foreground px-2">
                No repositories found
              </div>
            ) : (
              repositories.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => onSelectRepo(repo.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    selectedRepo === repo.id
                      ? "bg-accent text-accent-foreground font-semibold shadow-lg scale-105"
                      : "text-foreground hover:bg-secondary hover:translate-x-1"
                  }`}
                >
                  <div className="truncate">{repo.repo}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(repo.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        <p>Connected to localhost:8080</p>
      </div>
    </div>
  );
}
