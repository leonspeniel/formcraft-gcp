"use client";

import { useEffect, useState } from "react";
import { getMe, UserProfileResponse, signoutUser } from "../../services/auth";
import { getMyForms, FormResponse } from "../../services/forms";
import { getDashboardStats, getFormSubmissions, DashboardStats } from "../../services/dashboard";
import { SubmissionResponse } from "../../services/fills";
import SubmissionTable from "../../components/SubmissionTable";

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfileResponse | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [forms, setForms] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Submissions selection state
  const [selectedForm, setSelectedForm] = useState<FormResponse | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);

  // UI interaction feedback
  const [copySuccess, setCopySuccess] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const currentUser = await getMe();
        if (!currentUser) {
          // Unauthenticated redirect
          window.location.href = "/login";
          return;
        }
        setUser(currentUser);

        // Fetch parallel dashboards stats and form collections
        const [statsData, formsData] = await Promise.all([
          getDashboardStats(),
          getMyForms(),
        ]);

        setStats(statsData);
        setForms(formsData);
      } catch (err) {
        console.error("Failed to load dashboard statistics or details", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleSelectFormForSubmissions = async (form: FormResponse) => {
    setSelectedForm(form);
    setSubmissions([]);
    setLoadingSubmissions(true);
    try {
      const data = await getFormSubmissions(form.id);
      setSubmissions(data);
    } catch (err) {
      console.error("Failed to retrieve form submissions", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleCopyToClipboard = (formId: string) => {
    if (typeof window === "undefined") return;
    const shareableUrl = `${window.location.origin}/fill/${formId}`;
    navigator.clipboard.writeText(shareableUrl).then(
      () => {
        setCopySuccess((prev) => ({ ...prev, [formId]: true }));
        setTimeout(() => {
          setCopySuccess((prev) => ({ ...prev, [formId]: false }));
        }, 2000);
      },
      (err) => {
        console.error("Could not copy public URL: ", err);
      }
    );
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: "1rem" }}>
        <div className="spinner" style={{ width: "40px", height: "40px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>Fetching your secure creator profile...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper" style={{ width: "100%", maxWidth: "1200px", padding: "1rem 1.5rem" }}>
      {/* Header section with Greeting and CTA */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.25rem",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              marginBottom: "0.25rem",
            }}
          >
            Welcome, <span className="logo-accent">{user?.full_name}</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
            Design dynamic questionnaires, distribute links, and monitor response insights.
          </p>
        </div>
        <button
          className="btn-primary-glow"
          style={{ width: "auto", padding: "0.8rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
          onClick={() => {
            window.location.href = "/create";
          }}
        >
          <span style={{ fontSize: "1.2rem", fontWeight: 700 }}>+</span> Create Form
        </button>
      </header>

      {/* Aggregate Stats Cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <div
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 600, letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Total Forms
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)" }}>
            {stats?.total_forms ?? 0}
          </div>
        </div>
        
        <div
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 600, letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Total Submissions
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--accent-primary)" }}>
            {stats?.total_submissions ?? 0}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-glass)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 600, letterSpacing: "1px", marginBottom: "0.5rem" }}>
            Active Published Forms
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--accent-success)" }}>
            {stats?.active_forms ?? 0}
          </div>
        </div>
      </section>

      {/* Main split work layout */}
      <section style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* Your Forms section */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "1.25rem",
            }}
          >
            Your Active Forms
          </h2>

          {forms.length === 0 ? (
            <div
              style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-lg)",
                padding: "4rem 2rem",
                textAlign: "center",
                backdropFilter: "blur(12px)",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📝</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                No Forms Created Yet
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
                Begin by engineering your very first dynamic form. Choose between checkbox questions, text-answers, or radio options.
              </p>
              <button
                className="btn-primary-glow"
                style={{ width: "auto", padding: "0.75rem 1.5rem" }}
                onClick={() => {
                  window.location.href = "/create";
                }}
              >
                Create Your First Form
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {forms.map((form) => {
                const isSelected = selectedForm?.id === form.id;
                return (
                  <div
                    key={form.id}
                    style={{
                      background: isSelected ? "rgba(99, 102, 241, 0.05)" : "var(--bg-glass)",
                      border: isSelected ? "1px solid var(--accent-primary)" : "1px solid var(--border-glass)",
                      borderRadius: "var(--radius-md)",
                      padding: "1.5rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "1rem",
                      transition: "var(--transition-smooth)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "250px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600 }}>
                          {form.title}
                        </h3>
                        <span
                          style={{
                            background: form.is_published ? "rgba(16, 185, 129, 0.12)" : "rgba(100, 116, 139, 0.12)",
                            border: form.is_published ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(100, 116, 139, 0.25)",
                            color: form.is_published ? "#34d399" : "#94a3b8",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "10px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {form.is_published ? "Active" : "Draft"}
                        </span>
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                        {form.description || "No description provided."}
                      </p>
                      <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        <span>Questions: {form.questions.length}</span>
                        <span>•</span>
                        <span>Responses collected: {form.submissions_count}</span>
                        <span>•</span>
                        <span>Created: {new Date(form.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions block */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      <button
                        className="nav-btn-outline"
                        style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                        onClick={() => handleCopyToClipboard(form.id)}
                      >
                        {copySuccess[form.id] ? "✓ Copied!" : "📋 Copy Link"}
                      </button>
                      <a
                        href={`/fill/${form.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="nav-btn-text"
                        style={{ textDecoration: "none", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                      >
                        ↗ Open Public
                      </a>
                      <button
                        className="btn-primary-glow"
                        style={{
                          width: "auto",
                          fontSize: "0.85rem",
                          padding: "0.5rem 1.25rem",
                          background: isSelected ? "var(--accent-success)" : undefined,
                        }}
                        onClick={() => handleSelectFormForSubmissions(form)}
                      >
                        {isSelected ? "Inspecting Responses" : "👁 View Submissions"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic responses inspector section */}
        {selectedForm && (
          <div
            id="responses-inspector"
            style={{
              marginTop: "1.5rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--border-glass)",
              animation: "slideIn 0.35s ease-out",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--accent-primary)", fontWeight: 600, letterSpacing: "1px" }}>
                  Feedback Analyzer
                </span>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginTop: "0.15rem" }}>
                  Responses: {selectedForm.title}
                </h2>
              </div>
              <button
                className="nav-btn-text"
                style={{ color: "var(--accent-danger)" }}
                onClick={() => setSelectedForm(null)}
              >
                ✕ Close Inspector
              </button>
            </div>

            {loadingSubmissions ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem", gap: "0.75rem" }}>
                <div className="spinner" style={{ width: "30px", height: "30px", border: "2px solid var(--border-glass)", borderTopColor: "var(--accent-primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading feedback records...</p>
              </div>
            ) : (
              <SubmissionTable formSchema={selectedForm} submissions={submissions} />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
