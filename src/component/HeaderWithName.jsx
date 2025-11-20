import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react' // Using lucide-react for consistency

export default function HeaderWithName({ title, to = -1, rightAction = null, overwriteNavButton = null }) {
  const navigate = useNavigate()

  return (
    // Using secBg for the header background and dividerBorder for the bottom border
    <header className="secBg dividerBorder p-4">
      <div className="max-w-[430px] mx-auto flex items-center gap-3">
        {/* Conditional Back Button */}
        {overwriteNavButton === null ? (
          <button
            onClick={() => navigate(to)}
            aria-label="Go back"
            // btnSecondary is appropriate for a standard, non-primary action
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg btnSecondary"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          // A placeholder to maintain layout if the button isn't rendered
          // Added min-w-11 to perfectly match the button's footprint
          <div className="min-h-11 min-w-11" >
            {overwriteNavButton}
          </div>
        )}

        {/* Title */}
        <h1 className="text-xl font-semibold primText">
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