"use client"

import { useEffect, useState } from "react"
import confetti from "canvas-confetti"

interface RewardAnimationProps {
  onComplete?: () => void
}

export function RewardAnimation({ onComplete }: RewardAnimationProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Launch confetti
    const duration = 2000
    const end = Date.now() + duration

    const launchConfetti = () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FFC700", "#FF0080", "#00FFFF", "#7928CA"],
      })

      if (Date.now() < end) {
        requestAnimationFrame(launchConfetti)
      }
    }

    launchConfetti()

    // Hide animation after duration
    const timer = setTimeout(() => {
      setVisible(false)
      if (onComplete) onComplete()
    }, duration + 500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!visible) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="text-center">
        <div className="text-5xl font-bold text-primary animate-bounce mb-4">Great Job!</div>
        <div className="text-2xl text-primary/80">You improved your score!</div>
      </div>
    </div>
  )
}

