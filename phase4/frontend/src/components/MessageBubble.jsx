import { useEffect, useRef } from 'react'

export default function MessageBubble({ 
  role, 
  content, 
  loading = false,
  speechEnabled = false,
  onAudioStart = () => {},
  onAudioEnd = () => {}
}) {
  const audioRef = useRef(null)
  const hasPlayedRef = useRef(false)

  // Auto-play when speechEnabled and message loads
  useEffect(() => {
    if (speechEnabled && role === 'assistant' && !loading && !hasPlayedRef.current) {
      hasPlayedRef.current = true
      playAudio()
    }
  }, [speechEnabled, role, loading, content])

  async function playAudio() {
    try {
      onAudioStart() // Notify parent to pause any other audio
      
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
        URL.revokeObjectURL(url)
        audioRef.current = null
        onAudioEnd() // Notify parent audio finished
      }
      
      audio.play()
    } catch {
      // Silent fail
      onAudioEnd()
    }
  }

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }

  return (
    <div className={`bubble ${role}${loading ? ' loading' : ''}`}>
      <span className="bubble-label">
        {role === 'user' ? 'You' : 'Raven'}
        {speechEnabled && role === 'assistant' && <span className="speech-badge">🔊</span>}
      </span>
      <p>{content}</p>
      {role === 'assistant' && !loading && (
        <button
          className="speak-btn"
          onClick={audioRef.current ? stopAudio : playAudio}
          title={audioRef.current ? 'Stop audio' : 'Play audio'}
          aria-label={audioRef.current ? 'Stop audio' : 'Play audio'}
        >
          {audioRef.current ? (
            // Stop icon
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            // Speaker icon
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg>
          )}
        </button>
      )}
    </div>
  )
}