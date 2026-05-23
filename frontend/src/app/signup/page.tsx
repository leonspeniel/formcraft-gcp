"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "../services/auth";

export default function SignupPage() {
  const router = useRouter();
  
  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Operational states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Simple frontend validations
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage("All fields are strictly required.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      await signupUser({
        full_name: fullName,
        email: email,
        password: password,
      });

      setSuccessMessage("Account created successfully! Redirecting to login...");
      
      // Clear inputs
      setFullName("");
      setEmail("");
      setPassword("");

      // Brief delay before router transition
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setErrorMessage(err.response.data.detail);
      } else {
        setErrorMessage("Signup failed. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>Join <span className="logo-accent">Form</span>Craft</h1>
        <p>Start designing forms and analyzing feedback today.</p>
      </div>

      {errorMessage && (
        <div className="alert-box alert-error">
          <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="alert-box alert-success">
          <svg style={{ width: "18px", height: "18px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label htmlFor="full-name-input">Full Name</label>
          <div className="input-container">
            <input
              id="full-name-input"
              type="text"
              className="auth-input"
              placeholder="E.g., John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email-input">Email Address</label>
          <div className="input-container">
            <input
              id="email-input"
              type="email"
              className="auth-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password-input">Password (8+ Characters)</label>
          <div className="input-container">
            <input
              id="password-input"
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          id="signup-submit-btn"
          type="submit"
          className="btn-primary-glow"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Sign Up"}
        </button>
      </form>

      <div className="auth-footer-prompt">
        Already have an account?{" "}
        <a href="/login" className="auth-link">
          Sign In
        </a>
      </div>
    </div>
  );
}
