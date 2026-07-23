import { useState, useRef, useCallback, useId } from 'react'

const MAX_SIZE_MB = 8
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const ACCEPTED_ATTR = 'image/jpeg,image/png,image/webp,image/heic'
const DISCLAIMER = 'For informational purposes only — not a diagnosis. If symptoms are severe or sudden, seek medical care.'


export default function ImageUpload({ onSend, disabled = false, compact = false }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef(null)
  const descriptionId = useId()

  const validateAndSetFile = useCallback((candidate) => {
    if (!candidate) return
    setError('')

    if (!ACCEPTED_TYPES.includes(candidate.type)) {
      setError('Please upload a JPEG, PNG, WEBP, or HEIC image.')
      return
    }
    if (candidate.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`That image is over ${MAX_SIZE_MB}MB. Try a smaller file.`)
      return
    }

    setFile(candidate)
    setPreviewUrl(URL.createObjectURL(candidate))
  }, [])

  function handleInputChange(e) {
    validateAndSetFile(e.target.files?.[0])
    e.target.value = '' // allow re-selecting the same file later
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return
    validateAndSetFile(e.dataTransfer.files?.[0])
  }

  function handleDragOver(e) {
    e.preventDefault()
    if (disabled || isUploading) return
    setIsDragging(true)
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
    setDescription('')
    setError('')
  }

  async function handleAnalyze() {
    if (!file || isUploading) return
    setIsUploading(true)
    setError('')
    try {
      // Send both description text and image file to parent
      await onSend(file, description.trim())
      reset()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className={`image-upload${compact ? ' image-upload--compact' : ''}`}>
      {!file ? (
        <div
          className={[
            'image-upload__dropzone',
            isDragging && 'is-dragging',
            disabled && 'is-disabled',
          ].filter(Boolean).join(' ')}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !disabled && inputRef.current?.click()}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Attach a photo of your symptom"
          title="Attach a photo"
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          <svg className="image-upload__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path
              d="M4 16.5V6a2 2 0 0 1 2-2h4.3M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-.4M14 4h6v6M9.5 14.5l2.8-2.8 2 2L19 9"
              fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          {!compact && (
            <div className="image-upload__copy">
              <span className="image-upload__title">Add a photo</span>
              <span className="image-upload__hint">
                Drag & drop, or tap to upload · JPG, PNG, WEBP up to {MAX_SIZE_MB}MB
              </span>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_ATTR}
            capture="environment"
            onChange={handleInputChange}
            disabled={disabled}
            className="image-upload__input"
          />
        </div>
      ) : (
        <div className="image-upload__panel">
          <div className="image-upload__thumb-wrap">
            <img src={previewUrl} alt="Selected symptom photo preview" className="image-upload__thumb" />
            <button
              type="button"
              className="image-upload__remove"
              onClick={reset}
              disabled={isUploading}
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>

          <div className="image-upload__meta">
            <span className="image-upload__filename">{file.name}</span>
            <span className="image-upload__filesize">{formatSize(file.size)}</span>
          </div>

          {/* Text + Image together section */}
          <div className="image-upload__text-section">
            <label htmlFor={descriptionId} className="image-upload__label">
              Describe your symptom
            </label>
            <p className="image-upload__helper">
              Tell Raven when it started, what it feels like, or any other details that will help with the analysis
            </p>
            <textarea
              id={descriptionId}
              className="image-upload__description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. This rash appeared 2 days ago on my arm. It's itchy and slightly raised. Feels warm to the touch."
              rows={3}
              disabled={isUploading}
              aria-describedby="helper-text"
            />
            <p id="helper-text" className="image-upload__hint">
              Your description + photo will be analyzed together
            </p>
          </div>

          <div className="image-upload__actions">
            <button 
              type="button" 
              className="image-upload__cancel" 
              onClick={reset} 
              disabled={isUploading}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="image-upload__analyze" 
              onClick={handleAnalyze} 
              disabled={isUploading || !description.trim()}
              title={!description.trim() ? 'Please describe your symptom' : 'Analyze photo with description'}
            >
              {isUploading ? (
                <>
                  <span className="image-upload__spinner" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                'Analyze photo'
              )}
            </button>
          </div>

          {error && <p className="image-upload__error" role="alert">{error}</p>}
          <p className="image-upload__disclaimer">{DISCLAIMER}</p>
        </div>
      )}

      {!file && error && <p className="image-upload__error" role="alert">{error}</p>}
      {!file && !compact && <p className="image-upload__disclaimer">{DISCLAIMER}</p>}
    </div>
  )
}