import api from "./api";

export interface UserSignupPayload {
  email: string;
  password_hash?: string; // mapping parameters for standard request structure
  password?: string;
  full_name: string;
}

export interface UserSigninPayload {
  email: string;
  password?: string;
}

export interface UserProfileResponse {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

/**
 * Registers a new creator or responder account on the backend.
 */
export async function signupUser(payload: UserSignupPayload): Promise<UserProfileResponse> {
  // Map standard signup fields
  const requestData = {
    email: payload.email,
    password: payload.password,
    full_name: payload.full_name,
  };
  const response = await api.post<UserProfileResponse>("/api/v1/auth/signup", requestData);
  return response.data;
}

/**
 * Authenticates user credentials with the backend, and saves the JWT to localStorage.
 */
export async function signinUser(payload: UserSigninPayload): Promise<TokenResponse> {
  const requestData = {
    email: payload.email,
    password: payload.password,
  };
  const response = await api.post<TokenResponse>("/api/v1/auth/signin", requestData);
  
  if (response.data && response.data.access_token) {
    localStorage.setItem("auth_token", response.data.access_token);
  }
  return response.data;
}

/**
 * Fetches the currently logged in user profile session.
 */
export async function getMe(): Promise<UserProfileResponse | null> {
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) return null;
    
    const response = await api.get<UserProfileResponse>("/api/v1/auth/me");
    return response.data;
  } catch (error) {
    // If the token is invalid or expired, return null cleanly
    return null;
  }
}

/**
 * Destroys the active session by removing the auth token from localStorage.
 */
export function signoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    window.location.href = "/login";
  }
}
