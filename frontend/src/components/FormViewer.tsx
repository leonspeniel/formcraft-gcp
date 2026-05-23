"use client";

import { useEffect, useState } from "react";
import { FormResponse, QuestionResponse } from "../services/forms";
import { submitAnswers, AnswerCreatePayload } from "../services/fills";
import { getMe } from "../services/auth";

interface FormViewerProps {
  formSchema: FormResponse;
}

export default function FormViewer({ formSchema }: FormViewerProps) {
  // Personal profiles states (with auto-population)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);

  // Answers payload states (keyed by question ID)
  const [textAnswers, setTextAnswers] = useState<Record<number, string>>({});
  const [radioAnswers, setRadioAnswers] = useState<Record<number, string>>({});
  const [checkboxAnswers, setCheckboxAnswers] = useState<Record<number, string[]>>({});

  // Operational states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Check and auto-populate user data if logged in
  useEffect(() => {
    async function populateUser() {
      const user = await getMe();
      if (user) {
        setName(user.full_name);
        setEmail(user.email);
      }
      setCheckingUser(false);
    }
    populateUser();
  }, []);

  // Set up initial state for empty checkboxes
  useEffect(() => {
    const initialCheckboxes: Record<number, string[]> = {};
    formSchema.questions.forEach((q) => {
      if (q.question_type === "checkbox") {
        initialCheckboxes[q.id] = [];
      }
    });
    setCheckboxAnswers(initialCheckboxes);
  }, [formSchema]);

  // Handle inputs changes
  const handleTextChange = (qId: number, text: string) => {
    setTextAnswers({ ...textAnswers, [qId]: text });
    setErrorMessage("");
  };

  const handleRadioChange = (qId: number, selected: string) => {
    setRadioAnswers({ ...radioAnswers, [qId]: selected });
    setErrorMessage("");
  };

  const handleCheckboxChange = (qId: number, choice: string, checked: boolean) => {
    const current = checkboxAnswers[qId] || [];
    let updated: string[];
    if (checked) {
      updated = [...current, choice];
    } else {
      updated = current.filter((item) => item !== choice);
    }
    setCheckboxAnswers({ ...checkboxAnswers, [qId]: updated });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // Frontend layout validations
    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      setIsLoading(false);
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    const payloadAnswers: AnswerCreatePayload[] = [];
    
    // Validate each question according to its schema definitions
    for (let i = 0; i < formSchema.questions.length; i++) {
      const q = formSchema.questions[i];
      let valuePayload: any = {};
      let hasValue = false;

      if (q.question_type === "text") {
        const text = textAnswers[q.id] || "";
        valuePayload = { text: text.trim() };
        hasValue = text.trim().length > 0;
      } else if (q.question_type === "radio") {
        const selected = radioAnswers[q.id] || "";
        valuePayload = { selected: selected };
        hasValue = selected.length > 0;
      } else if (q.question_type === "checkbox") {
        const checked = checkboxAnswers[q.id] || [];
        valuePayload = { checked: checked };
        hasValue = checked.length > 0;
      }

      // Check required validation
      if (q.is_required && !hasValue) {
        setErrorMessage(`Question #${i + 1} ("${q.question_text}") is required.`);
        setIsLoading(false);
        return;
      }

      payloadAnswers.push({
        question_id: q.id,
        value: valuePayload,
      });
    }

    try {
      await submitAnswers(formSchema.id, {
        responder_name: name.trim(),
        responder_email: email.trim(),
        answers: payloadAnswers,
      });
      setSubmitted(true);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setErrorMessage(err.response.data.detail);
      } else {
        setErrorMessage("Could not submit your responses. Please verify your fields.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-card" style={{ maxWidth: "560px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✨</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Response Submitted!
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem" }}>
          Thank you for filling out this questionnaire. Your response has been securely saved.
        </p>
        <button
          className="btn-primary-glow"
          onClick={() => { if (typeof window !== "undefined") window.location.reload(); }}
        >
          Submit Another Response
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "680px" }}>
      {/* Form Title & Description card */}
      <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-md)", padding: "2.5rem", marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          {formSchema.title}
        </h1>
        {formSchema.description && (
          <p style={{ color: "var(--text-secondary)", fontSize: "1rem", lineHeight: 1.5 }}>
            {formSchema.description}
          </p>
        )}
      </div>

      {errorMsg && (
        <div className="alert-box alert-error">
          <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Responder Personal Information card */}
        <div style={{ background: "var(--bg-glass)", border: "1px solid var(--border-glass)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 600, marginBottom: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", color: "var(--text-secondary)" }}>
            Responder Identity
          </h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="responder-name-input">Your Name *</label>
              <input
                id="responder-name-input"
                type="text"
                className="auth-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrorMessage(""); }}
                disabled={isLoading || checkingUser}
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="responder-email-input">Email Address *</label>
              <input
                id="responder-email-input"
                type="email"
                className="auth-input"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMessage(""); }}
                disabled={isLoading || checkingUser}
              />
            </div>
          </div>
        </div>

        {/* Form Questions Cards Stack */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {formSchema.questions.map((q, index) => (
            <div
              key={q.id}
              className="question-card"
              style={{
                background: "var(--bg-glass)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-md)",
                padding: "2rem",
              }}
            >
              {/* Question text title */}
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.05rem", fontWeight: 600, marginBottom: "1.25rem", lineHeight: 1.4 }}>
                <span style={{ color: "var(--text-secondary)", marginRight: "0.5rem" }}>{index + 1}.</span>
                {q.question_text}
                {q.is_required && <span style={{ color: "var(--accent-danger)", marginLeft: "0.25rem" }}>*</span>}
              </h3>

              {/* Text Question rendering */}
              {q.question_type === "text" && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Your answer..."
                    value={textAnswers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Radio (Single Choice) rendering */}
              {q.question_type === "radio" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {q.options?.map((option, oIndex) => (
                    <label
                      key={oIndex}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        cursor: "pointer",
                        userSelect: "none",
                        fontSize: "0.95rem",
                        color: radioAnswers[q.id] === option ? "var(--text-primary)" : "var(--text-secondary)",
                        fontWeight: radioAnswers[q.id] === option ? 500 : 400,
                        transition: "var(--transition-smooth)"
                      }}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        checked={radioAnswers[q.id] === option}
                        onChange={() => handleRadioChange(q.id, option)}
                        disabled={isLoading}
                        style={{ transform: "scale(1.25)", accentColor: "var(--accent-primary)" }}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {/* Checkbox (Multiple Choice) rendering */}
              {q.question_type === "checkbox" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {q.options?.map((option, oIndex) => {
                    const isChecked = (checkboxAnswers[q.id] || []).includes(option);
                    return (
                      <label
                        key={oIndex}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          cursor: "pointer",
                          userSelect: "none",
                          fontSize: "0.95rem",
                          color: isChecked ? "var(--text-primary)" : "var(--text-secondary)",
                          fontWeight: isChecked ? 500 : 400,
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleCheckboxChange(q.id, option, e.target.checked)}
                          disabled={isLoading}
                          style={{ transform: "scale(1.25)", accentColor: "var(--accent-primary)" }}
                        />
                        {option}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Form Submission button */}
        <button
          type="submit"
          className="btn-primary-glow"
          style={{ padding: "1.1rem", marginTop: "1rem" }}
          disabled={isLoading || checkingUser}
        >
          {isLoading ? "Submitting Answers..." : "Submit Response"}
        </button>
      </form>
    </div>
  );
}
