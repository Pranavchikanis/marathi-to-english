/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { usePlayback } from '../synthesis'

describe('usePlayback', () => {
  let mockSpeak: any
  let mockCancel: any

  beforeEach(() => {
    mockSpeak = vi.fn()
    mockCancel = vi.fn()

    ;(window as any).speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel
    }

    class MockSpeechSynthesisUtterance {
      text: string
      lang: string = ''
      rate: number = 1
      onstart: any = null
      onend: any = null
      onerror: any = null
      constructor(text: string) {
        this.text = text
      }
    }
    ;(window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance
  })

  it('initializes correctly when supported', () => {
    const { result } = renderHook(() => usePlayback())
    expect(result.current.isSupported).toBe(true)
    expect(result.current.isPlaying).toBe(false)
  })

  it('initializes as unsupported when speechSynthesis is missing', () => {
    delete (window as any).speechSynthesis
    const { result } = renderHook(() => usePlayback())
    expect(result.current.isSupported).toBe(false)
  })

  it('calls speak and updates state', () => {
    const { result } = renderHook(() => usePlayback())
    
    act(() => {
      result.current.playAudio('test', 'en-US')
    })

    expect(mockCancel).toHaveBeenCalled()
    expect(mockSpeak).toHaveBeenCalled()
    
    // The utterance is passed to speak. We need to trigger the onstart event
    const utterance = mockSpeak.mock.calls[0][0]
    expect(utterance.text).toBe('test')
    expect(utterance.lang).toBe('en-US')
    expect(utterance.rate).toBe(0.9) // We explicitly set this in the hook

    act(() => {
      utterance.onstart()
    })
    
    expect(result.current.isPlaying).toBe(true)

    act(() => {
      utterance.onend()
    })
    
    expect(result.current.isPlaying).toBe(false)
  })

  it('stops audio correctly', () => {
    const { result } = renderHook(() => usePlayback())
    
    act(() => {
      result.current.playAudio('test')
    })
    
    const utterance = mockSpeak.mock.calls[0][0]
    act(() => {
      utterance.onstart()
    })

    expect(result.current.isPlaying).toBe(true)

    act(() => {
      result.current.stopAudio()
    })

    expect(mockCancel).toHaveBeenCalledTimes(2) // Once on play, once on stop
    expect(result.current.isPlaying).toBe(false)
  })
})
