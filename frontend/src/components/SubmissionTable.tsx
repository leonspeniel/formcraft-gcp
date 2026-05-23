"use client";

import React from "react";
import { FormResponse, QuestionResponse } from "../services/forms";
import { SubmissionResponse } from "../services/fills";

interface SubmissionTableProps {
  formSchema: FormResponse;
  submissions: SubmissionResponse[];
}

export default function SubmissionTable({ formSchema, submissions }: SubmissionTableProps) {
  // Sort questions by order_index to match the form design layout
  const sortedQuestions = [...formSchema.questions].sort((a, b) => a.order_index - b.order_index);

  const formatSubmittedAt = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const renderAnswerValue = (question: QuestionResponse, answers: any[]) => {
    const matchedAnswer = answers.find((ans) => ans.question_id === question.id);
    if (!matchedAnswer || !matchedAnswer.value) {
      return <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>-</span>;
    }

    const { value } = matchedAnswer;

    if (question.question_type === "text") {
      return <span style={{ color: "var(--text-primary)" }}>{value.text || "-"}</span>;
    }

    if (question.question_type === "radio") {
      return (
        <span
          style={{
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            color: "#818cf8",
            padding: "0.25rem 0.6rem",
            borderRadius: "12px",
            fontSize: "0.8rem",
            fontWeight: 500,
            display: "inline-block",
          }}
        >
          {value.selected || "-"}
        </span>
      );
    }

    if (question.question_type === "checkbox") {
      const checkedOptions = value.checked || [];
      if (checkedOptions.length === 0) {
        return <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>-</span>;
      }
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {checkedOptions.map((opt: string, i: number) => (
            <span
              key={i}
              style={{
                background: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                color: "#34d399",
                padding: "0.25rem 0.6rem",
                borderRadius: "12px",
                fontSize: "0.8rem",
                fontWeight: 500,
              }}
            >
              {opt}
            </span>
          ))}
        </div>
      );
    }

    return <span style={{ color: "var(--text-muted)" }}>-</span>;
  };

  if (submissions.length === 0) {
    return (
      <div
        style={{
          background: "var(--bg-glass)",
          border: "1px solid var(--border-glass)",
          padding: "3rem",
          borderRadius: "var(--radius-md)",
          textAlign: "center",
          color: "var(--text-secondary)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "var(--text-muted)" }}>📥</div>
        <h3 style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          No Submissions Yet
        </h3>
        <p style={{ fontSize: "0.95rem" }}>Share your published form link to start collecting answers.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        background: "var(--bg-glass)",
        border: "1px solid var(--border-glass)",
        borderRadius: "var(--radius-lg)",
        backdropFilter: "blur(16px)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: "0.95rem",
        }}
      >
        <thead>
          <tr
            style={{
              borderBottom: "1px solid var(--border-glass)",
              background: "rgba(15, 23, 42, 0.4)",
            }}
          >
            <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontFamily: "var(--font-display)", minWidth: "150px" }}>
              Responder
            </th>
            <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontFamily: "var(--font-display)", minWidth: "150px" }}>
              Email
            </th>
            <th style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 600, fontFamily: "var(--font-display)", minWidth: "150px" }}>
              Date Submitted
            </th>
            {sortedQuestions.map((q) => (
              <th
                key={q.id}
                style={{
                  padding: "1rem 1.25rem",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                  fontFamily: "var(--font-display)",
                  minWidth: "200px",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  maxWidth: "350px",
                }}
                title={q.question_text}
              >
                {q.question_text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, idx) => (
            <tr
              key={sub.id}
              style={{
                borderBottom: idx === submissions.length - 1 ? "none" : "1px solid var(--border-glass)",
                background: idx % 2 === 0 ? "transparent" : "rgba(255, 255, 255, 0.01)",
                transition: "var(--transition-smooth)",
              }}
              className="table-row-hover"
            >
              <td style={{ padding: "1rem 1.25rem", fontWeight: 500, color: "var(--text-primary)" }}>
                {sub.responder_name}
              </td>
              <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                {sub.responder_email}
              </td>
              <td style={{ padding: "1rem 1.25rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {formatSubmittedAt(sub.submitted_at)}
              </td>
              {sortedQuestions.map((q) => (
                <td key={q.id} style={{ padding: "1rem 1.25rem" }}>
                  {renderAnswerValue(q, sub.answers)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <style jsx global>{`
        .table-row-hover:hover {
          background-color: var(--bg-glass-hover) !important;
        }
      `}</style>
    </div>
  );
}
