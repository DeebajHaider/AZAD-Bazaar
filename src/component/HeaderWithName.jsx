import { useNavigate } from 'react-router-dom'

export default function HeaderWithName({ to = '/', title }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4">
      <div className="max-w-[430px] mx-auto flex items-center gap-3">
        <button
          onClick={() => navigate(to)}
          className="min-h-11 min-w-11 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-50 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-slate-50">
          {title}
        </h1>
      </div>
    </div>
  )
}