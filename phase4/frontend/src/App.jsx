import { useState } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import ImageUpload from './components/ImageUpload'
import './App.css'

const WELCOME = "Hi, I'm Raven — your personal health assistant. Describe your symptoms and I'll help you understand what might be going on. Remember, I'm not a substitute for professional medical advice."

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
  ])
  const [loading, setLoading] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(false)
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null)

  async function sendMessage(text) {
    const userMsg = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setLoading(true)

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      })

      if (!res.ok) throw new Error('Server error')

      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  async function sendImageMessage(file, caption) {
    const userMsg = {
      role: 'user',
      content: caption || '📷 Photo attached',
      image: URL.createObjectURL(file),
    }
    const next = [...messages, userMsg]
    setMessages(next)
    setLoading(true)

    const formData = new FormData()
    formData.append('image', file)
    formData.append('message', caption)
    formData.append('history', JSON.stringify(messages))

    try {
      const res = await fetch('/chat/image', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Server error')

      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages([...next, { role: 'assistant', content: 'Something went wrong analyzing that photo. Please try again.' }])
      throw err // re-throw so ImageUpload also shows its own inline error and keeps the photo selected
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        speechEnabled={speechEnabled}
        onSpeechChange={setSpeechEnabled}
      />

      <div className="main-content">
        <header className="app-header">
          <h1>Health <span>AI</span></h1>
        </header>

        <ChatWindow
          messages={messages}
          loading={loading}
          speechEnabled={speechEnabled}
          onAudioStart={setCurrentlyPlayingId}
          onAudioEnd={setCurrentlyPlayingId}
        />

        <div className="composer">
          <InputBar onSend={sendMessage} disabled={loading} />
          <ImageUpload disabled={loading} onSend={sendImageMessage} compact />
        </div>
      </div>
    </div>
  )
}