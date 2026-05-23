import api from "./api";
import { SubmissionResponse } from "./fills";

export interface DashboardStats {
  total_forms: number;
  total_submissions: number;
  active_forms: number;
}

/**
 * Fetches all submissions/responses collected for a specific form owned by the current user.
 */
export async function getFormSubmissions(formId: string): Promise<SubmissionResponse[]> {
  const response = await api.get<SubmissionResponse[]>(`/api/v1/forms/${formId}/submissions`);
  return response.data;
}

/**
 * Fetches creator stats including aggregate forms count, total submissions, and active forms.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>("/api/v1/dashboard/stats");
  return response.data;
}
