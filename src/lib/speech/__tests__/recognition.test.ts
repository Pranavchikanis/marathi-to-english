/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSpeech } from '../recognition'

describe('useSpeech', () => {
  let MockSpeechRecognition: any
  let mockRecognitionInstance: any

  beforeEach(() => {
    // Mock the browser SpeechRecognition API
    mockRecognitionInstance = {
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      continuous: false,
      interimResults: false,
      lang: ''
    }

    class MockSpeechRecognition {
      constructor() {
        return mockRecognitionInstance
      }
    }
    ;(window as any).SpeechRecognition = MockSpeechRecognition
  })

  it('initializes with IDLE state when supported', () => {
    const { result } = renderHook(() => useSpeech())
    expect(result.current.isSupported).toBe(true)
    expect(result.current.state).toBe('IDLE')
  })

  it('initializes with UNSUPPORTED state when not available', () => {
    delete (window as any).SpeechRecognition
    delete (window as any).webkitSpeechRecognition
    const { result } = renderHook(() => useSpeech())
    expect(result.current.isSupported).toBe(false)
    expect(result.current.state).toBe('UNSUPPORTED')
  })

  it('transitions to RECORDING on start', () => {
    const { result } = renderHook(() => useSpeech())
    
    act(() => {
      result.current.startRecording()
    })

    expect(mockRecognitionInstance.start).toHaveBeenCalled()
    
    // Simulate API firing the onstart event
    act(() => {
      mockRecognitionInstance.onstart()
    })

    expect(result.current.state).toBe('RECORDING')
  })

  it('captures transcript on result', () => {
    const { result } = renderHook(() => useSpeech())
    
    act(() => {
      result.current.startRecording()
      mockRecognitionInstance.onstart()
    })

    // Simulate API firing the onresult event
    const mockEvent = {
      resultIndex: 0,
      results: [
        [{ transcript: 'hello world' }]
      ]
    }
    
    act(() => {
      mockRecognitionInstance.onresult(mockEvent)
    })

    expect(result.current.transcript).toBe('hello world')
  })

  it('transitions to PROCESSING on stop', () => {
    const { result } = renderHook(() => useSpeech())
    
    act(() => {
      result.current.startRecording()
      mockRecognitionInstance.onstart()
    })

    act(() => {
      result.current.stopRecording()
    })

    expect(mockRecognitionInstance.stop).toHaveBeenCalled()
    expect(result.current.state).toBe('PROCESSING')
  })

  it('transitions to ERROR on speech recognition error', () => {
    const { result } = renderHook(() => useSpeech())
    
    act(() => {
      result.current.startRecording()
      mockRecognitionInstance.onstart()
    })

    act(() => {
      mockRecognitionInstance.onerror({ error: 'not-allowed' })
    })

    expect(result.current.state).toBe('ERROR')
    expect(result.current.error).toBe('not-allowed')
  })

  it('cleans up on unmount', () => {
    const { unmount } = renderHook(() => useSpeech())
    unmount()
    expect(mockRecognitionInstance.abort).toHaveBeenCalled()
  })
})
