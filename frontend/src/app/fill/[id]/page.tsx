"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFormSchema, FormResponse } from "../../../services/forms";
import FormViewer from "../../../components/FormViewer";

export default function FillFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  const [formSchema, setFormSchema] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!formId) return;

    async function loadForm() {
      try {
        const schema = await getFormSchema(formId);
        setFormSchema(schema);
      } catch (err: any) {
        if (err.response && err.response.data && err.response.data.detail) {
          setError(err.response.data.detail);
        } else {
          setError("Failed to load questionnaire. Please verify the URL.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }} className="logo-accent">⌛</div>
        <p style={{ fontSize: "1.1rem" }}>Loading questionnaire details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-card" style={{ maxWidth: "560px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Questionnaire Unavailable
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem" }}>
          {error}
        </p>
        <button
          className="btn-primary-glow"
          onClick={() => router.push("/")}
        >
          Go Back Home
        </button>
      </div>
    );
  }

  if (!formSchema) {
    return null;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", padding: "2rem 0" }}>
      <FormViewer formSchema={formSchema} />
    </div>
  );
}
