export default function MessageBubble({ role, content, loading = false }) {
  return (
    <div className={`bubble ${role}${loading ? ' loading' : ''}`}>
      <span className="bubble-label">{role === 'user' ? 'You' : 'Raven'}</span>
      <p>{content}</p>
    </div>
  )
}
