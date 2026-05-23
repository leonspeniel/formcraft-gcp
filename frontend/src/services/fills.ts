import api from "./api";

export interface AnswerCreatePayload {
  question_id: number;
  value: {
    text?: string;
    selected?: string;
    checked?: string[];
  };
}

export interface SubmissionCreatePayload {
  responder_name: string;
  responder_email: string;
  answers: AnswerCreatePayload[];
}

export interface AnswerResponse {
  question_id: number;
  value: {
    text?: string;
    selected?: string;
    checked?: string[];
  };
}

export interface SubmissionResponse {
  id: number;
  responder_name: string;
  responder_email: string;
  submitted_at: string;
  answers: AnswerResponse[];
}

/**
 * Submits dynamic answers to a public form on the backend.
 * Accepts optional bearer session headers via the central axios api interceptor.
 */
export async function submitAnswers(formId: string, payload: SubmissionCreatePayload): Promise<SubmissionResponse> {
  const response = await api.post<SubmissionResponse>(`/api/v1/forms/${formId}/submissions`, payload);
  return response.data;
}
