import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages, loading, speechEnabled, onAudioStart, onAudioEnd }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="chat-window">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          role={msg.role}
          content={msg.content}
          speechEnabled={speechEnabled && msg.role === 'assistant'}
          onAudioStart={() => onAudioStart(i)}
          onAudioEnd={() => onAudioEnd(null)}
        />
      ))}
      {loading && <MessageBubble role="assistant" content="..." loading />}
      <div ref={bottomRef} />
    </div>
  )
}