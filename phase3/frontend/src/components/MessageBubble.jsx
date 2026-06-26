import { useState, useRef } from 'react'

export default function MessageBubble({ role, content, loading = false }) {
  const [playing, setPlaying] = useState(false)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const audioRef = useRef(null)

  async function toggleAudio() {
    if (playing) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlaying(false)
      return
    }

    setLoadingAudio(true)
    try {
      const res = await fetch('/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => {
        setPlaying(false)
        URL.revokeObjectURL(url)
        audioRef.current = null
      }
      audio.play()
      setPlaying(true)
    } catch {
      // silent fail — user can read the text
    } finally {
      setLoadingAudio(false)
    }
  }

  return (
    <div className={`bubble ${role}${loading ? ' loading' : ''}`}>
      <span className="bubble-label">{role === 'user' ? 'You' : 'Raven'}</span>
      <p>{content}</p>
      {role === 'assistant' && !loading && (
        <button
          className={`speak-btn${playing ? ' playing' : ''}`}
          onClick={toggleAudio}
          disabled={loadingAudio}
          title={playing ? 'Stop audio' : 'Listen to response'}
          aria-label={playing ? 'Stop audio' : 'Listen to response'}
        >
          {playing ? (
            // Stop icon
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : loadingAudio ? (
            // Spinner dots
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="4" cy="12" r="2.5" opacity="1" />
              <circle cx="12" cy="12" r="2.5" opacity="0.6" />
              <circle cx="20" cy="12" r="2.5" opacity="0.3" />
            </svg>
          ) : (
            // Speaker icon
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          )}
        </button>
      )}
    </div>
  )
}
