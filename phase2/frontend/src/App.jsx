import { useState } from 'react'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import './App.css'

const WELCOME = "Hi, I'm Raven — your personal health assistant. Describe your symptoms and I'll help you understand what might be going on. Remember, I'm not a substitute for professional medical advice."

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: WELCOME },
  ])
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Raven <span>Health AI</span></h1>
      </header>
      <ChatWindow messages={messages} loading={loading} />
      <InputBar onSend={sendMessage} disabled={loading} />
    </div>
  )
}
