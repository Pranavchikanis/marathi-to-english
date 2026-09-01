import { ActionError, ErrorCode, ActionResult } from '@/types/api.types'

// Internal Error Classes
export class AppError extends Error {
  public code: ErrorCode
  public retryable: boolean
  
  constructor(message: string, code: ErrorCode, retryable: boolean = false) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.retryable = retryable
  }
}

export class ProviderError extends AppError {
  constructor(message: string = 'Connection issue. Please retry.', retryable: boolean = true) {
    super(message, 'PROVIDER_ERROR', retryable)
    this.name = 'ProviderError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Invalid request data.') {
    super(message, 'INVALID_INPUT', false)
    this.name = 'ValidationError'
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Session expired. Please log in again.') {
    super(message, 'UNAUTHORIZED', false)
    this.name = 'AuthError'
  }
}

export class DuplicateSubmissionError extends AppError {
  constructor(message: string = 'Answer already submitted for this exercise.') {
    super(message, 'DUPLICATE_SUBMISSION', false)
    this.name = 'DuplicateSubmissionError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found.') {
    super(message, 'NOT_FOUND', false)
    this.name = 'NotFoundError'
  }
}

// Normalizer
export function normalizeError(error: unknown): ActionError {
  const referenceId = typeof crypto !== 'undefined' ? crypto.randomUUID() : undefined;

  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      referenceId,
    }
  }

  // Handle Supabase/PostgREST errors generically without exposing SQL
  if (error && typeof error === 'object' && 'code' in error && 'details' in error) {
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'A database error occurred. Please try again.',
      retryable: false,
      referenceId,
    }
  }

  // Default fallback for unknown errors
  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong. Please try again.',
    retryable: true,
    referenceId,
  }
}

// Higher Order Function for Server Actions
export function withErrorHandling<T, Args extends any[]>(
  action: (...args: Args) => Promise<ActionResult<T>>
): (...args: Args) => Promise<ActionResult<T>> {
  return async (...args: Args): Promise<ActionResult<T>> => {
    try {
      return await action(...args)
    } catch (error) {
      // Log the raw error on the server
      console.error('[Server Action Error]', error)
      
      const normalized = normalizeError(error)
      return { success: false, error: normalized }
    }
  }
}
