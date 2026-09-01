export type ErrorCode = 
  | 'AI_SERVICE_UNAVAILABLE'
  | 'INVALID_INPUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SESSION_NOT_FOUND'
  | 'NOT_FOUND'
  | 'DUPLICATE_SUBMISSION'
  | 'INTERNAL_SERVER_ERROR'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'STATE_ERROR'
  | 'VOICE_ERROR';

export interface ActionError {
  code: ErrorCode;
  message: string;
  retryable?: boolean;
  referenceId?: string;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };
