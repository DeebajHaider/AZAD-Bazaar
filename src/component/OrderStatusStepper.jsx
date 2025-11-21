import React from 'react'
import { Check, Circle, X } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import dayjs from 'dayjs'

const OrderStatusStepper = ({ currentStatus, history = [] }) => {
  const { t } = useI18n()

  const steps = [
    { key: 'pending', label: 'placed' },
    { key: 'confirmed', label: 'confirmed' },
    { key: 'shipped', label: 'shipped' },
    { key: 'delivered', label: 'delivered' }
  ]

  const normalizedCurrent = currentStatus?.toLowerCase() || 'pending'
  const isFailed = ['cancelled', 'failed', 'canceled'].includes(normalizedCurrent)

  let currentStepIndex = steps.findIndex(s => s.key === normalizedCurrent)
  if (normalizedCurrent === 'processing') currentStepIndex = 1
  if (currentStepIndex === -1 && !isFailed) currentStepIndex = 0

  // Compact Failed State
  if (isFailed) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-8 h-8 rounded-full accentDangerBg flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <X size={16} />
        </div>
        <div>
          <p className="font-bold primText text-sm">
            {t(`orders.status.${normalizedCurrent}`, normalizedCurrent)}
          </p>
          <p className="text-xs secText">
            {t('orders.status.failedMessage', 'Order cancelled.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative pl-1">
      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex
        const isCurrent = index === currentStepIndex
        const isLast = index === steps.length - 1

        const historyEntry = history.find(h => h.status === step.key)
        const timeString = historyEntry ? dayjs(historyEntry.timestamp).format('MMM D, HH:mm') : null

        return (
          // Reduced vertical spacing: pb-4 instead of mb-6
          <div key={step.key} className={`flex gap-3 relative ${!isLast ? 'pb-5' : ''}`}>
            
            {/* Vertical Line */}
            {!isLast && (
              // Adjusted for w-6 icons: Left 11px centers it (24px/2 - 1px)
              <div 
                className={`absolute left-[11px] top-6 bottom-0 w-[2px] ${
                  index < currentStepIndex ? 'accentPrimBg' : 'bg-gray-200 dark:bg-slate-700'
                }`} 
              />
            )}

            {/* Compact Icon (w-6 h-6) */}
            <div className="relative z-10 flex-shrink-0">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center border-[1.5px] transition-colors duration-300 ${
                  isCompleted 
                    ? 'accentPrimBg border-transparent text-white' 
                    : 'bg-white dark:bg-slate-950 primBorder secText'
                } ${isCurrent ? 'ring-2 ring-blue-100 dark:ring-blue-900' : ''}`}
              >
                {isCompleted ? <Check size={12} /> : <Circle size={8} />}
              </div>
            </div>

            {/* Compact Text Content */}
            <div className={`pt-0.5 flex-1 ${isCompleted ? 'opacity-100' : 'opacity-60'}`}>
              <div className="flex justify-between items-baseline">
                <p className={`leading-none ${isCurrent ? 'font-bold primText text-sm' : 'font-medium primText text-sm'}`}>
                  {t(`orders.step.${step.label}`, step.label)}
                </p>
                
                {/* Timestamp is now inline on the right to save vertical space */}
                {timeString && (
                  <span className="text-[10px] secText tabular-nums">
                    {timeString}
                  </span>
                )}
              </div>
              
              {/* Current Status Indicator */}
              {isCurrent && (
                 <p className="text-[11px] secText mt-1 animate-pulse leading-tight">
                   {t('orders.status.inProgress', 'Processing...')}
                 </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OrderStatusStepper