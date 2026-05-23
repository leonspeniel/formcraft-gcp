"use client";

import { useState } from "react";
import { createForm, QuestionCreatePayload } from "../services/forms";

interface LocalQuestion {
  id: string; // temporary local id for keying
  question_text: string;
  question_type: "text" | "checkbox" | "radio";
  is_required: boolean;
  options: string[];
}

export default function FormBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<LocalQuestion[]>([
    {
      id: "initial-q-1",
      question_text: "",
      question_type: "text",
      is_required: false,
      options: ["Option 1"],
    },
  ]);

  // Operational states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMessage] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Add a new empty question to the bottom of the designer
  const addQuestion = () => {
    const newId = `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setQuestions([
      ...questions,
      {
        id: newId,
        question_text: "",
        question_type: "text",
        is_required: false,
        options: ["Option 1"],
      },
    ]);
  };

  // Remove a question from the builder
  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      setErrorMessage("Forms must contain at least one question.");
      return;
    }
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // Handle question field modifications
  const updateQuestionText = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question_text = text;
    setQuestions(updated);
  };

  const updateQuestionType = (index: number, type: "text" | "checkbox" | "radio") => {
    const updated = [...questions];
    updated[index].question_type = type;
    // Set default initial option if switching to options-based questions
    if ((type === "checkbox" || type === "radio") && updated[index].options.length === 0) {
      updated[index].options = ["Option 1"];
    }
    setQuestions(updated);
  };

  const toggleRequired = (index: number) => {
    const updated = [...questions];
    updated[index].is_required = !updated[index].is_required;
    setQuestions(updated);
  };

  // Handle choice options modifications (for checkbox / radio)
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    updated[qIndex].options.push(`Option ${updated[qIndex].options.length + 1}`);
    setQuestions(updated);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options.length === 1) {
      return; // Must have at least one choice option
    }
    updated[qIndex].options.splice(oIndex, 1);
    setQuestions(updated);
  };

  const updateOptionText = (qIndex: number, oIndex: number, text: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = text;
    setQuestions(updated);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setCreatedUrl("");

    // Frontend layout validations
    if (!title.trim()) {
      setErrorMessage("Please supply a valid Form Title.");
      setIsLoading(false);
      return;
    }

    const formattedQuestions: QuestionCreatePayload[] = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setErrorMessage(`Question #${i + 1} has an empty question label.`);
        setIsLoading(false);
        return;
      }

      const isChoiceBased = q.question_type === "checkbox" || q.question_type === "radio";
      const cleanedOptions = isChoiceBased
        ? q.options.map((o) => o.trim()).filter((o) => o.length > 0)
        : undefined;

      if (isChoiceBased && (!cleanedOptions || cleanedOptions.length === 0)) {
        setErrorMessage(`Question #${i + 1} ('${q.question_type}') requires at least one option.`);
        setIsLoading(false);
        return;
      }

      formattedQuestions.push({
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        is_required: q.is_required,
        order_index: i,
        options: cleanedOptions,
      });
    }

    try {
      const res = await createForm({
        title: title.trim(),
        description: description.trim() || undefined,
        questions: formattedQuestions,
      });

      // Formulate copyable public URL
      const publicUrl = `${window.location.origin}/fill/${res.id}`;
      setCreatedUrl(publicUrl);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setErrorMessage(err.response.data.detail);
      } else {
        setErrorMessage("An unexpected server error occurred while publishing the form.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && createdUrl) {
      navigator.clipboard.writeText(createdUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // If successfully published, display public share panel
  if (createdUrl) {
    return (
      <div className="auth-card" style={{ maxWidth: "560px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚀</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Form Published Live!
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem" }}>
          Your dynamically composed questionnaire is now active and ready to collect responder feedback.
        </p>

        <div className="form-group" style={{ textAlign: "left" }}>
          <label>Public Submission Link</label>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <input
              type="text"
              readOnly
              className="auth-input"
              value={createdUrl}
              style={{ flexGrow: 1, fontFamily: "monospace", fontSize: "0.85rem", background: "rgba(0,0,0,0.2)" }}
            />
            <button
              onClick={copyToClipboard}
              className="nav-btn-outline"
              style={{ whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              {copiedLink ? "Copied! ✓" : "Copy Link"}
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <button
            className="btn-primary-glow"
            onClick={() => { if (typeof window !== "undefined") window.location.href = `/fill/${createdUrl.split("/").pop()}`; }}
          >
            Fill Out Form
          </button>
          <button
            className="nav-btn-outline"
            style={{ width: "100%", padding: "0.85rem" }}
            onClick={() => { if (typeof window !== "undefined") window.location.href = "/dashboard"; }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "720px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700 }}>Design Questionnaire</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Add and configure form questions incrementally.</p>
        </div>
        <button
          className="nav-btn-outline"
          onClick={() => { if (typeof window !== "undefined") window.location.href = "/dashboard"; }}
        >
          Cancel
        </button>
      </div>

      {errorMsg && (
        <div className="alert-box alert-error">
          <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handlePublish} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* General Form Metadata Card */}
        <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
          <div className="form-group">
            <label htmlFor="form-title-input">Form Title</label>
            <input
              id="form-title-input"
              type="text"
              className="auth-input"
              placeholder="E.g., Customer Feedback Survey"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrorMessage(""); }}
              disabled={isLoading}
              style={{ fontSize: "1.1rem", fontWeight: 600 }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="form-description-input">Description (Optional)</label>
            <textarea
              id="form-description-input"
              className="auth-input"
              placeholder="Briefly state the goal of this questionnaire..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              style={{ resize: "vertical" }}
            />
          </div>
        </div>

        {/* Dynamic Interactive Questions Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {questions.map((q, qIndex) => (
            <div
              key={q.id}
              className="question-card"
              style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-md)",
                padding: "2rem",
                position: "relative",
                transition: "var(--transition-smooth)"
              }}
            >
              {/* Question Index Badge and Delete Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-secondary)" }}>
                  Question #{qIndex + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  style={{ background: "none", border: "none", color: "var(--accent-danger)", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem" }}
                >
                  ✕ Remove
                </button>
              </div>

              {/* Question Title input */}
              <div className="form-group">
                <label>Question Label</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="E.g., How would you rate our platform?"
                  value={q.question_text}
                  onChange={(e) => { updateQuestionText(qIndex, e.target.value); setErrorMessage(""); }}
                  disabled={isLoading}
                />
              </div>

              {/* Question Config grid (Type selector & Required switch) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: q.question_type !== "text" ? "1.5rem" : "0" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Response Field Type</label>
                  <select
                    className="auth-input"
                    value={q.question_type}
                    onChange={(e) => updateQuestionType(qIndex, e.target.value as any)}
                    disabled={isLoading}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="text">Text Input Field</option>
                    <option value="checkbox">Checkboxes (Multiple Choice)</option>
                    <option value="radio">Radio Buttons (Single Choice)</option>
                  </select>
                </div>

                {/* Custom Styled Switch or Toggle checkbox */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", userSelect: "none", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500, margin: 0, textTransform: "none" }}>
                    <input
                      type="checkbox"
                      checked={q.is_required}
                      onChange={() => toggleRequired(qIndex)}
                      disabled={isLoading}
                      style={{ transform: "scale(1.25)", accentColor: "var(--accent-primary)" }}
                    />
                    Mandatory Question
                  </label>
                </div>
              </div>

              {/* Interactive Choice Options (Shown only for Checkbox & Radio questions) */}
              {q.question_type !== "text" && (
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "1.5rem", borderRadius: "var(--radius-sm)", border: "1px dashed rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-secondary)" }}>
                      Response Choices
                    </span>
                    <button
                      type="button"
                      onClick={() => addOption(qIndex)}
                      disabled={isLoading}
                      style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
                    >
                      + Add Choice
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
                          {q.question_type === "radio" ? "○" : "☐"}
                        </span>
                        <input
                          type="text"
                          className="auth-input"
                          value={option}
                          onChange={(e) => updateOptionText(qIndex, oIndex, e.target.value)}
                          disabled={isLoading}
                          placeholder={`Option ${oIndex + 1}`}
                          style={{ padding: "0.6rem 0.85rem" }}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(qIndex, oIndex)}
                          disabled={isLoading}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            fontSize: "1.1rem",
                            cursor: q.options.length > 1 ? "pointer" : "not-allowed",
                            padding: "0 0.5rem"
                          }}
                          title="Remove Choice"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Central Form actions */}
        <button
          type="button"
          onClick={addQuestion}
          disabled={isLoading}
          className="nav-btn-outline"
          style={{ width: "100%", padding: "1rem", borderStyle: "dashed", borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.01)" }}
        >
          + Add Question Card
        </button>

        <button
          type="submit"
          className="btn-primary-glow"
          style={{ marginTop: "1rem", padding: "1.1rem" }}
          disabled={isLoading}
        >
          {isLoading ? "Saving Form Structure..." : "Publish Dynamic Form"}
        </button>
      </form>
    </div>
  );
}
