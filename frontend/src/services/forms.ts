import api from "./api";

export interface QuestionCreatePayload {
  question_text: string;
  question_type: "text" | "checkbox" | "radio";
  is_required: boolean;
  order_index: number;
  options?: string[];
}

export interface FormCreatePayload {
  title: string;
  description?: string;
  questions: QuestionCreatePayload[];
}

export interface QuestionResponse {
  id: number;
  question_text: string;
  question_type: "text" | "checkbox" | "radio";
  is_required: boolean;
  order_index: number;
  options?: string[];
}

export interface FormResponse {
  id: string;
  title: string;
  description?: string;
  is_published: boolean;
  created_at: string;
  questions: QuestionResponse[];
  submissions_count: number;
}

/**
 * Creates and publishes a dynamic form with structural questions on the backend.
 */
export async function createForm(payload: FormCreatePayload): Promise<FormResponse> {
  const response = await api.post<FormResponse>("/api/v1/forms", payload);
  return response.data;
}

/**
 * Fetches all forms designed and owned by the currently authenticated user.
 */
export async function getMyForms(): Promise<FormResponse[]> {
  const response = await api.get<FormResponse[]>("/api/v1/forms");
  return response.data;
}

/**
 * Fetches the questions layout of a public form by its UUID.
 */
export async function getFormSchema(id: string): Promise<FormResponse> {
  const response = await api.get<FormResponse>(`/api/v1/forms/${id}`);
  return response.data;
}
