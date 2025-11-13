import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react' // Using lucide-react for consistency

export default function HeaderWithName({ title, to = -1, rightAction = null, overwriteNavButton = null }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4">
      <div className="max-w-[430px] mx-auto flex items-center gap-3">
        {/* Conditional Back Button */}
        {(overwriteNavButton === null) ? (
          <button
            onClick={() => navigate(to)}
            aria-label="Go back"
            className="min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          // A placeholder to maintain layout if the button isn't rendered
          <div className="min-h-11">
          </div>
        )}
        {/* Title */}
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
          {title}
        </h1>

        {/* Right Action Slot */}
        {rightAction && (
          <div className="ml-auto">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  )
}