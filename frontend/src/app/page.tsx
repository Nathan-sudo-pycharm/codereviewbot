"use client";
import { useEffect, useState } from "react";

const API = "http://localhost:8080";

type Repo = { id: number; repo: string; created_at: string };
type Finding = {
  file: string;
  line: number | null;
  severity: string;
  issue: string;
  suggestion: string;
};
type Review = {
  id: number;
  findings: Finding[];
  model: string;
  tokens_used: number;
  created_at: string;
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ef4444",
  major: "#f97316",
  minor: "#eab308",
  suggestion: "#3b82f6",
};

const SEVERITY_EMOJI: Record<string, string> = {
  critical: "🔴",
  major: "🟠",
  minor: "🟡",
  suggestion: "💡",
};

export default function Dashboard() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    pr_count: number;
    review_count: number;
  } | null>(null);

  useEffect(() => {
    fetch(`${API}/repos`)
      .then((r) => r.json())
      .then((data) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadReviews = async (repo: Repo) => {
    setSelectedRepo(repo);
    setSelectedReview(null);
    setReviews([]);
    const statsRes = await fetch(`${API}/repos/${repo.id}/stats`);
    const statsData = await statsRes.json();
    setStats(statsData);
    // Try PRs 1-20 to find reviews
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
    setReviews(found);
  };

  const totalFindings = (review: Review) => review.findings?.length || 0;
  const findingsBySeverity = (review: Review, sev: string) =>
    review.findings?.filter((f) => f.severity === sev).length || 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0a0f",
        color: "#e2e8f0",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #1e293b",
          padding: "0 2rem",
          display: "flex",
          alignItems: "center",
          height: "60px",
          background: "#0d0d14",
        }}
      >
        <span
          style={{
            fontSize: "1.2rem",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
        >
          🤖 <span style={{ color: "#6ee7b7" }}>CodeReview</span>Bot
        </span>
        <span
          style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#475569" }}
        >
          AI-powered PR reviews
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          minHeight: "calc(100vh - 60px)",
        }}
      >
        {/* Sidebar */}
        <div
          style={{
            borderRight: "1px solid #1e293b",
            padding: "1.5rem 1rem",
            background: "#0d0d14",
          }}
        >
          <div
            style={{
              fontSize: "0.65rem",
              color: "#475569",
              letterSpacing: "2px",
              marginBottom: "1rem",
              textTransform: "uppercase",
            }}
          >
            Registered Repos
          </div>

          {loading && (
            <div style={{ color: "#475569", fontSize: "0.8rem" }}>
              Loading...
            </div>
          )}

          {repos.map((repo) => (
            <div
              key={repo.id}
              onClick={() => loadReviews(repo)}
              style={{
                padding: "0.75rem",
                borderRadius: "6px",
                cursor: "pointer",
                marginBottom: "0.5rem",
                background:
                  selectedRepo?.id === repo.id ? "#1e293b" : "transparent",
                border:
                  selectedRepo?.id === repo.id
                    ? "1px solid #334155"
                    : "1px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: "0.8rem", color: "#e2e8f0" }}>
                📁 {repo.repo}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#475569",
                  marginTop: "0.25rem",
                }}
              >
                {new Date(repo.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}

          {!loading && repos.length === 0 && (
            <div
              style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.6 }}
            >
              No repos registered yet.
              <br />
              <br />
              Register one via:
              <br />
              <code style={{ color: "#6ee7b7", fontSize: "0.65rem" }}>
                POST /repos
              </code>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ padding: "2rem" }}>
          {!selectedRepo && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "60vh",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "3rem" }}>🤖</div>
              <div style={{ color: "#475569", fontSize: "0.9rem" }}>
                Select a repo to view its reviews
              </div>
            </div>
          )}

          {selectedRepo && (
            <>
              {/* Repo header */}
              <div style={{ marginBottom: "2rem" }}>
                <h1
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#f1f5f9",
                    margin: 0,
                  }}
                >
                  {selectedRepo.repo}
                </h1>
                {stats && (
                  <div
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      marginTop: "1rem",
                    }}
                  >
                    {[
                      { label: "Pull Requests", value: stats.pr_count },
                      { label: "Reviews", value: stats.review_count },
                      {
                        label: "Findings",
                        value: reviews.reduce(
                          (a, r) => a + totalFindings(r),
                          0,
                        ),
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        style={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          borderRadius: "8px",
                          padding: "0.75rem 1.25rem",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#6ee7b7",
                          }}
                        >
                          {s.value}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#64748b",
                            marginTop: "0.25rem",
                          }}
                        >
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviews list */}
              {reviews.length === 0 && (
                <div style={{ color: "#475569", fontSize: "0.85rem" }}>
                  No reviews found for this repo yet.
                </div>
              )}

              <div style={{ display: "grid", gap: "1rem" }}>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    onClick={() =>
                      setSelectedReview(
                        selectedReview?.id === review.id ? null : review,
                      )
                    }
                    style={{
                      background: "#111827",
                      border:
                        selectedReview?.id === review.id
                          ? "1px solid #6ee7b7"
                          : "1px solid #1e293b",
                      borderRadius: "8px",
                      padding: "1.25rem",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {/* Review summary */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom:
                          selectedReview?.id === review.id ? "1rem" : 0,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                          Review #{review.id} ·{" "}
                          {new Date(review.created_at).toLocaleString()}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#475569",
                            marginTop: "0.25rem",
                          }}
                        >
                          {review.model} · {review.tokens_used} tokens
                        </div>
                      </div>

                      {/* Severity badges */}
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {["critical", "major", "minor", "suggestion"].map(
                          (sev) => {
                            const count = findingsBySeverity(review, sev);
                            if (!count) return null;
                            return (
                              <span
                                key={sev}
                                style={{
                                  background: SEVERITY_COLOR[sev] + "22",
                                  border: `1px solid ${SEVERITY_COLOR[sev]}44`,
                                  color: SEVERITY_COLOR[sev],
                                  borderRadius: "4px",
                                  padding: "0.2rem 0.5rem",
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                }}
                              >
                                {SEVERITY_EMOJI[sev]} {count}
                              </span>
                            );
                          },
                        )}
                        {totalFindings(review) === 0 && (
                          <span
                            style={{ color: "#6ee7b7", fontSize: "0.75rem" }}
                          >
                            ✅ Clean
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expanded findings */}
                    {selectedReview?.id === review.id &&
                      review.findings?.length > 0 && (
                        <div
                          style={{
                            display: "grid",
                            gap: "0.75rem",
                            borderTop: "1px solid #1e293b",
                            paddingTop: "1rem",
                          }}
                        >
                          {review.findings.map((f, i) => (
                            <div
                              key={i}
                              style={{
                                background: "#0a0a0f",
                                border: `1px solid ${SEVERITY_COLOR[f.severity] || "#334155"}33`,
                                borderLeft: `3px solid ${SEVERITY_COLOR[f.severity] || "#334155"}`,
                                borderRadius: "6px",
                                padding: "0.75rem 1rem",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  marginBottom: "0.5rem",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    color: SEVERITY_COLOR[f.severity],
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {SEVERITY_EMOJI[f.severity]} {f.severity}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.7rem",
                                    color: "#475569",
                                  }}
                                >
                                  {f.file}
                                  {f.line ? ` · line ${f.line}` : ""}
                                </span>
                              </div>
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#e2e8f0",
                                  marginBottom: "0.4rem",
                                }}
                              >
                                {f.issue}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#64748b",
                                }}
                              >
                                💬 {f.suggestion}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
