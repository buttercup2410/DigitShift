"use client"

import { useEffect, useState } from "react"
import ReactConfetti from "react-confetti"
import { useWindowSize } from "@/hooks/use-window-size"

export function Confetti() {
  const { width, height } = useWindowSize()
  const [isActive, setIsActive] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    
    // Play confetti sound
    const audio = new Audio('/confetti.mp3')
    audio.volume = 0.5 // Set volume to 50%
    audio.play().catch(error => {
      console.log('Audio playback failed:', error)
    })

    const timer = setTimeout(() => {
      setIsActive(false)
    }, 5000)

    return () => {
      clearTimeout(timer)
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  if (!isMounted || !isActive) return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <ReactConfetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={500}
        gravity={0.2}
      />
    </div>
  )
}

