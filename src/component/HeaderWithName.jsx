import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function HeaderWithName({ title, to = -1, rightAction = null, overwriteNavButton = null }) {
  const navigate = useNavigate()

  return (
    // 1. Container: 
    // - bg-md-surface: Matches the main app background for a clean Top App Bar feel.
    // - text-md-on-surface: Ensures all text inherits the correct high-contrast color.
    // - border-md-outline-variant: A subtle border for separation (Material "Outline Variant").
    <header className="bg-md-surface text-md-on-surface border-b border-md-outline-variant p-4">
      
      <div className="max-w-[430px] mx-auto flex items-center gap-3">
        {/* Conditional Back Button */}
        {overwriteNavButton === null ? (
          <button
            onClick={() => navigate(to)}
            aria-label="Go back"
            // 2. Button Action:
            // - bg-md-secondary-container: The correct mapping for a "Secondary" contained button.
            // - text-md-on-secondary-container: Ensures readable contrast on that container.
            // - rounded-md: Adhering to your specific design rule (changed from rounded-lg).
            className="min-h-11 min-w-11 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-90 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          // Placeholder matches dimensions
          <div className="min-h-11 min-w-11" >
            {overwriteNavButton}
          </div>
        )}

        {/* Title */}
        {/* 3. Typography:
             - text-md-on-surface: High emphasis text color. 
        */}
        <h1 className="text-xl font-semibold text-md-on-surface">
          {title}
        </h1>

        {/* Right Action Slot */}
        {rightAction && (
          <div className="ml-auto">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  )
}