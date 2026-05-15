"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { ReviewItems } from "@/components/dashboard/review-items";
import { Findings } from "@/components/dashboard/findings";

const API = "http://localhost:8080";

interface Repository {
  id: number;
  repo: string;
  created_at: string;
}

interface Finding {
  file: string;
  line: number | null;
  severity: string;
  issue: string;
  suggestion: string;
}

interface Review {
  id: number;
  findings: Finding[];
  model: string;
  tokens_used: number;
  created_at: string;
}

interface Stats {
  pr_count: number;
  review_count: number;
  findings_count: number;
}

export default function Home() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reposLoading, setReposLoading] = useState(true);

  // Fetch repositories on mount
  useEffect(() => {
    fetchRepositories();
  }, []);

  // Fetch stats and reviews when repo is selected
  useEffect(() => {
    if (selectedRepo) {
      fetchStats();
      fetchReviews();
    }
  }, [selectedRepo]);

  async function fetchRepositories() {
    try {
      setReposLoading(true);
      const res = await fetch(`${API}/repos`);
      const data = await res.json();
      setRepositories(data || []);
      if (data && data.length > 0) {
        setSelectedRepo(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching repos:", err);
    } finally {
      setReposLoading(false);
    }
  }

  async function fetchStats() {
    try {
      setLoading(true);
      const res = await fetch(`${API}/repos/${selectedRepo}/stats`);
      const data = await res.json();
      // fetch all reviews to count total findings
      const allReviews = await getAllReviews();
      const findingsCount = allReviews.reduce(
        (a, r) => a + (r.findings?.length || 0),
        0,
      );
      setStats({
        pr_count: data.pr_count || 0,
        review_count: data.review_count || 0,
        findings_count: findingsCount,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  }

  async function getAllReviews(): Promise<Review[]> {
    const found: Review[] = [];
    for (let i = 1; i <= 20; i++) {
      try {
        const res = await fetch(`${API}/reviews/${i}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) found.push(...data);
        }
      } catch {}
    }
    return found;
  }

  async function fetchReviews() {
    const allReviews = await getAllReviews();
    setReviews(allReviews);
    setSelectedReview(null);
  }

  const currentRepo = repositories.find((r) => r.id === selectedRepo);
  const currentReview = reviews.find((r) => r.id === selectedReview);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        repositories={repositories}
        selectedRepo={selectedRepo}
        onSelectRepo={setSelectedRepo}
        loading={reposLoading}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header repoName={currentRepo?.repo} />

        {currentRepo ? (
          <div className="flex-1 overflow-auto">
            <StatCards stats={stats} loading={loading} />

            <div className="grid grid-cols-3 gap-0">
              <div className="col-span-2 border-r border-border">
                <ReviewItems
                  reviews={reviews}
                  loading={loading}
                  selectedId={selectedReview}
                  onSelectReview={setSelectedReview}
                />
              </div>

              <div className="col-span-1">
                {currentReview ? (
                  <Findings findings={currentReview.findings} />
                ) : (
                  <div className="p-6 h-full flex items-center justify-center text-center">
                    <p className="text-muted-foreground text-sm">
                      Select a review to see detailed findings
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading repositories...</p>
          </div>
        )}
      </div>
    </div>
  );
}
