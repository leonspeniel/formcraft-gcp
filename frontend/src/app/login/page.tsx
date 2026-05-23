"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signinUser } from "../services/auth";

export default function LoginPage() {
  const router = useRouter();
  
  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Operational states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Simple frontend validations
    if (!email.trim() || !password) {
      setErrorMessage("Please fill in both email and password.");
      setIsLoading(false);
      return;
    }

    try {
      await signinUser({
        email: email,
        password: password,
      });

      setSuccessMessage("Sign in successful! Entering dashboard...");
      
      // Clear inputs
      setEmail("");
      setPassword("");

      // Brief delay before router transition
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setErrorMessage("Invalid email address or password.");
      } else if (err.response && err.response.data && err.response.data.detail) {
        setErrorMessage(err.response.data.detail);
      } else {
        setErrorMessage("Authentication failed. Please verify your connection.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Sign in to manage your interactive forms.</p>
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

      <form onSubmit={handleSignin}>
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
          <label htmlFor="password-input">Password</label>
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
          id="login-submit-btn"
          type="submit"
          className="btn-primary-glow"
          disabled={isLoading}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="auth-footer-prompt">
        New to FormCraft?{" "}
        <a href="/signup" className="auth-link">
          Create an Account
        </a>
      </div>
    </div>
  );
}
