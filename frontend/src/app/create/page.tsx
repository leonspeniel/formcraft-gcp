"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "../../services/auth";
import FormBuilder from "../../components/FormBuilder";

export default function CreateFormPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function verifyAuth() {
      const user = await getMe();
      if (!user) {
        // Force authentication prior to designing forms
        router.push("/login");
      } else {
        setCheckingAuth(false);
      }
    }
    verifyAuth();
  }, [router]);

  if (checkingAuth) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }} className="logo-accent">⌛</div>
        <p style={{ fontSize: "1.1rem" }}>Authorizing creator credentials...</p>
      </div>
    );
  }

  return <FormBuilder />;
}
