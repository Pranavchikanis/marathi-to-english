import { describe, it, expect, vi } from 'vitest'
import { 
  normalizeError, 
  withErrorHandling, 
  ProviderError, 
  ValidationError,
  AuthError,
  DuplicateSubmissionError,
  NotFoundError,
  AppError
} from '../error'

describe('Error Normalization', () => {
  it('should preserve AppError fields', () => {
    const error = new ProviderError('Custom message', false)
    const normalized = normalizeError(error)

    expect(normalized.code).toBe('PROVIDER_ERROR')
    expect(normalized.message).toBe('Custom message')
    expect(normalized.retryable).toBe(false)
    expect(normalized.referenceId).toBeDefined()
  })

  it('should normalize standard JS errors to INTERNAL_SERVER_ERROR', () => {
    const error = new Error('Random JS crash')
    const normalized = normalizeError(error)

    expect(normalized.code).toBe('INTERNAL_SERVER_ERROR')
    expect(normalized.message).toBe('Something went wrong. Please try again.')
    expect(normalized.retryable).toBe(true)
  })

  it('should normalize Supabase/PostgREST-like objects to INTERNAL_SERVER_ERROR', () => {
    const error = { code: '23505', details: 'Key already exists' }
    const normalized = normalizeError(error)

    expect(normalized.code).toBe('INTERNAL_SERVER_ERROR')
    expect(normalized.message).toBe('A database error occurred. Please try again.')
    expect(normalized.retryable).toBe(false)
  })

  it('should instantiate built-in custom errors correctly', () => {
    expect(new ValidationError().code).toBe('INVALID_INPUT')
    expect(new AuthError().code).toBe('UNAUTHORIZED')
    expect(new DuplicateSubmissionError().code).toBe('DUPLICATE_SUBMISSION')
    expect(new NotFoundError().code).toBe('NOT_FOUND')
    expect(new AppError('Test', 'VOICE_ERROR').code).toBe('VOICE_ERROR')
  })
})

describe('withErrorHandling', () => {
  it('should return successful ActionResults intact', async () => {
    const mockAction = vi.fn().mockResolvedValue({ success: true, data: { id: 1 } })
    const wrapped = withErrorHandling(mockAction)

    const result = await wrapped()
    expect(result).toEqual({ success: true, data: { id: 1 } })
  })

  it('should catch exceptions and return normalized ActionErrors', async () => {
    const mockAction = vi.fn().mockRejectedValue(new ProviderError('AI Down', true))
    const wrapped = withErrorHandling(mockAction)

    const result = await wrapped()
    expect(result.success).toBe(false)
    
    // Type assertion to access error property
    if (!result.success) {
      expect(result.error.code).toBe('PROVIDER_ERROR')
      expect(result.error.message).toBe('AI Down')
      expect(result.error.retryable).toBe(true)
    }
  })

  it('should catch unknown exceptions and hide internal messages', async () => {
    const mockAction = vi.fn().mockRejectedValue(new Error('Secret DB connection string failed'))
    const wrapped = withErrorHandling(mockAction)

    const result = await wrapped()
    expect(result.success).toBe(false)
    
    if (!result.success) {
      expect(result.error.code).toBe('INTERNAL_SERVER_ERROR')
      expect(result.error.message).toBe('Something went wrong. Please try again.')
      // Verify the secret didn't leak
      expect(result.error.message).not.toContain('Secret DB')
    }
  })
})
