import React from 'react'
import {
  Check,
  Package,
  Truck,
  Home
} from 'lucide-react'
import {
  useI18n
} from '../context/I18nContext'

const OrderStatusStepper = ({
  currentStatus
}) => {
  const {
    t
  } = useI18n()
  const steps = [{
    name: 'Placed',
    icon: Package
  }, {
    name: 'Confirmed',
    icon: Check
  }, {
    name: 'Shipped',
    icon: Truck
  }, {
    name: 'Delivered',
    icon: Home
  }, ]

  const getStatusIndex = (status) => {
    const normalizedStatus = status?.toLowerCase()
    if (normalizedStatus === 'delivered') return 3
    if (normalizedStatus === 'shipped') return 2
    if (normalizedStatus === 'confirmed' || normalizedStatus === 'processing') return 1
    if (normalizedStatus === 'placed' || normalizedStatus === 'pending') return 0
    return -1 // Default for cancelled/failed
  }

  const currentStepIndex = getStatusIndex(currentStatus)

  if (currentStepIndex < 0) {
    return (
      <div className="p-4 text-center accentDangerBg text-white font-medium rounded-lg">
        {t(`orders.status.${currentStatus.toLowerCase()}`, currentStatus)}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex
        const isActive = index === currentStepIndex
        const isFuture = index > currentStepIndex

        const iconColor = isCompleted || isActive ? 'accentPrimText' : 'secText'
        const textColor = isCompleted || isActive ? 'primText' : 'secText'
        const lineColor = isCompleted ? 'accentPrimBg' : 'primBorder'

        return (
          <React.Fragment key={step.name}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive ? 'accentPrimBg text-white' : isCompleted ? 'accentPrimBg text-white' : 'secBg primBorder'
                }`}>
                <step.icon size={20} className={isActive || isCompleted ? 'text-white' : 'secText'} />
              </div>
              <p className={`mt-2 text-xs font-medium ${textColor}`}>
                {t(`orders.step.${step.name.toLowerCase()}`)}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded-full ${lineColor}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default OrderStatusStepper