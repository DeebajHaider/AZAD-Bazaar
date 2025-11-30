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

  // --- 1. Failed State Theme ---
  if (isFailed) {
    return (
      <div className="flex items-center gap-3 py-2">
        {/* Error Circle: bg-md-error / text-md-on-error */}
        <div className="w-8 h-8 rounded-full bg-md-error flex items-center justify-center text-md-on-error shadow-sm flex-shrink-0">
          <X size={16} />
        </div>
        <div>
          <p className="font-bold text-md-on-surface text-sm">
            {t(`orders.status.${normalizedCurrent}`, normalizedCurrent)}
          </p>
          <p className="text-xs text-md-error">
            {t('orders.status.failedMessage', 'Order cancelled.')}
          </p>
        </div>
      </div>
    )
  }

  // --- 2. Stepper Theme ---
  return (
    <div className="relative pl-1">
      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex
        const isCurrent = index === currentStepIndex
        const isLast = index === steps.length - 1

        const historyEntry = history.find(h => h.status === step.key)
        const timeString = historyEntry ? dayjs(historyEntry.timestamp).format('MMM D, HH:mm') : null

        return (
          <div key={step.key} className={`flex gap-3 relative ${!isLast ? 'pb-5' : ''}`}>
            
            {/* Vertical Line */}
            {!isLast && (
              <div 
                className={`absolute left-[11px] top-6 bottom-0 w-[2px] ${
                  index < currentStepIndex 
                    ? 'bg-md-primary' // Active Line
                    : 'bg-md-surface-container-highest' // Inactive Line (Subtle)
                }`} 
              />
            )}

            {/* Icon Circle */}
            <div className="relative z-10 flex-shrink-0">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center border-[1.5px] transition-all duration-300 ${
                  isCompleted 
                    // Completed: Primary Fill, No Border
                    ? 'bg-md-primary border-transparent text-md-on-primary' 
                    // Pending: Surface BG, Outline Border
                    : 'bg-md-surface border-md-outline-variant text-md-on-surface-variant'
                } ${
                  // Current Ring: Primary color with opacity
                  isCurrent ? 'ring-2 ring-md-primary/30' : ''
                }`}
              >
                {isCompleted ? <Check size={12} strokeWidth={3} /> : <Circle size={8} />}
              </div>
            </div>

            {/* Text Content */}
            <div className={`pt-0.5 flex-1 ${isCompleted ? 'opacity-100' : 'opacity-60 grayscale'}`}>
              <div className="flex justify-between items-baseline">
                {/* Label: High Emphasis */}
                <p className={`leading-none text-md-on-surface text-sm ${isCurrent ? 'font-bold' : 'font-medium'}`}>
                  {t(`orders.step.${step.label}`, step.label)}
                </p>
                
                {/* Timestamp: Medium Emphasis */}
                {timeString && (
                  <span className="text-[10px] text-md-on-surface-variant tabular-nums">
                    {timeString}
                  </span>
                )}
              </div>
              
              {/* Current Status Indicator */}
              {isCurrent && (
                 <p className="text-[11px] text-md-primary mt-1 animate-pulse leading-tight font-medium">
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