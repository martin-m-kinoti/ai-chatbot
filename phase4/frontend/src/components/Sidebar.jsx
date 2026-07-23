export default function Sidebar({ speechEnabled, onSpeechChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
          <img src="/logo.png" alt="logo" className="logo"/>
          <h3>Raven Health AI</h3>
      </div>

      <div className="sidebar-section">
        <h4 className="section-title">Audio</h4>
        
        <label className="preference-item">
          <input
            type="checkbox"
            checked={speechEnabled}
            onChange={(e) => onSpeechChange(e.target.checked)}
            className="preference-input"
          />
          <span className="preference-label">
            <span className="preference-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume2-icon lucide-volume-2"><path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/><path d="M16 9a5 5 0 0 1 0 6"/><path d="M19.364 18.364a9 9 0 0 0 0-12.728"/></svg></span>
            Speech Responses
          </span>
        </label>

        <p className="preference-description">
          Automatically play audio for all responses
        </p>
      </div>

      <hr />

      {/* Future preferences sections can go here */}
      {/* 
      <div className="sidebar-section">
        <h4 className="section-title">Theme</h4>
        ...
      </div>

      <div className="sidebar-section">
        <h4 className="section-title">Privacy</h4>
        ...
      </div>
      */}
    </aside>
  )
}