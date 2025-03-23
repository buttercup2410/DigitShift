"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Confetti } from "./confetti"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Trophy, Undo, Redo, Volume2, VolumeX } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// The target sequence with empty space at the end
const TARGET_SEQUENCE = [8, 0, 1, 3, 9, 5, 2, 1, null]

// Maximum number of undo/redo actions
const MAX_HISTORY_ACTIONS = 5

export default function NumberPuzzle() {
  const [numbers, setNumbers] = useState<(number | null)[]>([])
  const [isWon, setIsWon] = useState(false)
  const [moves, setMoves] = useState(0)
  const [time, setTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [showWinDialog, setShowWinDialog] = useState(false)
  const [history, setHistory] = useState<(number | null)[][]>([])
  const [future, setFuture] = useState<(number | null)[][]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Audio context reference
  const audioContextRef = useRef<AudioContext | null>(null)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    resetGame()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      // Close audio context if it exists
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close()
        } catch (e) {
          console.error("Error closing audio context:", e)
        }
      }
    }
  }, [])

  useEffect(() => {
    checkWinCondition()
  }, [numbers])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying])

  // Play victory sound when game is won
  useEffect(() => {
    if (isWon && !isMuted) {
      playVictorySound()
    }
  }, [isWon, isMuted])

  // Function to play a click sound
  const playClickSound = () => {
    if (isMuted) return

    try {
      // Initialize audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const context = audioContextRef.current

      // Create oscillator
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      // Configure sound
      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(800, context.currentTime)
      oscillator.frequency.exponentialRampToValueAtTime(500, context.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.1, context.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1)

      // Connect nodes
      oscillator.connect(gainNode)
      gainNode.connect(context.destination)

      // Play sound
      oscillator.start()
      oscillator.stop(context.currentTime + 0.1)
    } catch (e) {
      console.error("Error playing click sound:", e)
    }
  }

  // Function to play a victory sound
  const playVictorySound = () => {
    if (isMuted) return

    try {
      // Initialize audio context if it doesn't exist
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const context = audioContextRef.current

      // Create oscillators for a chord
      const frequencies = [523.25, 659.25, 783.99] // C5, E5, G5

      frequencies.forEach((freq, i) => {
        const oscillator = context.createOscillator()
        const gainNode = context.createGain()

        oscillator.type = "sine"
        oscillator.frequency.value = freq

        gainNode.gain.setValueAtTime(0.1, context.currentTime + i * 0.1)
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1 + i * 0.1)

        oscillator.connect(gainNode)
        gainNode.connect(context.destination)

        oscillator.start(context.currentTime + i * 0.1)
        oscillator.stop(context.currentTime + 1 + i * 0.1)
      })
    } catch (e) {
      console.error("Error playing victory sound:", e)
    }
  }

  const createInitialState = () => {
    // Create a copy of the target sequence without the null
    const numbersOnly = TARGET_SEQUENCE.slice(0, -1)

    // Shuffle the numbers
    const shuffled = [...numbersOnly].sort(() => Math.random() - 0.5)

    // Create the initial state with middle empty
    const initialState = [
      shuffled[0],
      shuffled[1],
      shuffled[2],
      shuffled[3],
      null,
      shuffled[4],
      shuffled[5],
      shuffled[6],
      shuffled[7],
    ]

    // Ensure the puzzle is solvable
    if (!isSolvable(initialState)) {
      // If not solvable, swap two numbers to make it solvable
      // (swapping any two numbers changes the parity of inversions)
      ;[initialState[0], initialState[1]] = [initialState[1], initialState[0]]
    }

    return initialState
  }

  const resetGame = () => {
    // Create a new shuffled state with middle empty
    const initialState = createInitialState()

    setNumbers(initialState)
    setIsWon(false)
    setMoves(0)
    setTime(0)
    setIsPlaying(false)
    setGameStarted(false)
    setShowWinDialog(false)
    setHistory([])
    setFuture([])

    // Play click sound for feedback
    playClickSound()
  }

  // Check if a sliding puzzle configuration is solvable
  const isSolvable = (puzzle: (number | null)[]) => {
    // For a 3x3 puzzle, if the number of inversions is even, the puzzle is solvable
    const flatPuzzle = puzzle.filter((num) => num !== null) as number[]
    let inversions = 0

    for (let i = 0; i < flatPuzzle.length; i++) {
      for (let j = i + 1; j < flatPuzzle.length; j++) {
        if (flatPuzzle[i] > flatPuzzle[j]) {
          inversions++
        }
      }
    }

    return inversions % 2 === 0
  }

  const checkWinCondition = () => {
    if (numbers.length === 0) return

    // Check if all numbers are in the correct position
    const hasWon = TARGET_SEQUENCE.every((num, index) => num === numbers[index])

    if (hasWon && !isWon) {
      setIsWon(true)
      setIsPlaying(false)
      setShowWinDialog(true)
    }
  }

  const handleTileClick = (index: number) => {
    // Find the empty space
    const emptyIndex = numbers.findIndex((num) => num === null)

    // Check if the clicked tile is adjacent to the empty space
    if (!isAdjacent(index, emptyIndex)) return

    // Start the timer on first move
    if (!gameStarted) {
      setGameStarted(true)
      setIsPlaying(true)
    }

    // Add current state to history before making the move
    setHistory((prev) => {
      const newHistory = [...prev, [...numbers]]
      // Limit history size
      if (newHistory.length > MAX_HISTORY_ACTIONS) {
        return newHistory.slice(1)
      }
      return newHistory
    })

    // Clear future states when a new move is made
    setFuture([])

    // Swap the clicked tile with the empty space
    const newNumbers = [...numbers]
    newNumbers[emptyIndex] = numbers[index]
    newNumbers[index] = null

    setNumbers(newNumbers)
    setMoves((prevMoves) => prevMoves + 1)

    // Play click sound
    playClickSound()
  }

  const handleUndo = () => {
    if (history.length === 0) return

    // Get the last state from history
    const lastState = history[history.length - 1]

    // Add current state to future for redo
    setFuture((prev) => [numbers, ...prev].slice(0, MAX_HISTORY_ACTIONS))

    // Remove the last state from history
    setHistory((prev) => prev.slice(0, prev.length - 1))

    // Set the board to the previous state
    setNumbers(lastState)

    // Play click sound
    playClickSound()
  }

  const handleRedo = () => {
    if (future.length === 0) return

    // Get the first state from future
    const nextState = future[0]

    // Add current state to history
    setHistory((prev) => [...prev, numbers].slice(-MAX_HISTORY_ACTIONS))

    // Remove the first state from future
    setFuture((prev) => prev.slice(1))

    // Set the board to the next state
    setNumbers(nextState)

    // Play click sound
    playClickSound()
  }

  // Check if two positions are adjacent in a 3x3 grid
  const isAdjacent = (pos1: number, pos2: number) => {
    const row1 = Math.floor(pos1 / 3)
    const col1 = pos1 % 3
    const row2 = Math.floor(pos2 / 3)
    const col2 = pos2 % 3

    // Adjacent if they're in the same row and columns differ by 1,
    // or in the same column and rows differ by 1
    return (row1 === row2 && Math.abs(col1 - col2) === 1) || (col1 === col2 && Math.abs(row1 - row2) === 1)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-[#ffdddd] to-[#ffe6e6]">
      {isWon && <Confetti />}

      <Card className="w-full max-w-md p-6 space-y-6 shadow-lg bg-white border-[#4a7c59]">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#4a7c59]">DigitShift Challenge</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="h-8 w-8 border-[#ff8a5c] text-[#ff8a5c] hover:bg-[#fff1e6]"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <p className="text-[#4a7c59]">
          Click tiles to slide them into the correct sequence: <span className="font-mono font-bold">80139521_</span>
        </p>

        <div className="flex justify-between px-2">
          <div className="flex items-center gap-2 text-[#4a7c59]">
            <span className="font-medium">Time:</span> {formatTime(time)}
          </div>
          <div className="flex items-center gap-2 text-[#4a7c59]">
            <span className="font-medium">Moves:</span> {moves}
          </div>
        </div>

        <div className="p-4 bg-[#ffeeee] rounded-lg">
          <div className="grid grid-cols-3 gap-2">
            {numbers.map((number, index) => (
              <div
                key={index}
                onClick={() => handleTileClick(index)}
                className={`flex items-center justify-center w-full h-20 text-2xl font-bold rounded-md transition-all
                  ${
                    number === null
                      ? "bg-[#ffe6e6] border-2 border-dashed border-[#4a7c59]"
                      : number === TARGET_SEQUENCE[index]
                        ? "bg-[#e0eec6] text-[#4a7c59] border border-[#4a7c59] cursor-pointer"
                        : "bg-white text-[#4a7c59] border border-[#ffcccc] hover:bg-[#fff5f5] cursor-pointer shadow-sm"
                  }`}
              >
                {number !== null ? number : ""}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleUndo}
              variant="outline"
              size="sm"
              disabled={history.length === 0}
              className="flex items-center gap-1 border-[#4a7c59] text-[#4a7c59] hover:bg-[#e0eec6]"
            >
              <Undo className="h-4 w-4" />
              <span>Undo</span>
              <Badge variant="secondary" className="ml-1 bg-[#ffeeee] text-[#4a7c59]">
                {history.length}/{MAX_HISTORY_ACTIONS}
              </Badge>
            </Button>
            <Button
              onClick={handleRedo}
              variant="outline"
              size="sm"
              disabled={future.length === 0}
              className="flex items-center gap-1 border-[#4a7c59] text-[#4a7c59] hover:bg-[#e0eec6]"
            >
              <Redo className="h-4 w-4" />
              <span>Redo</span>
              <Badge variant="secondary" className="ml-1 bg-[#ffeeee] text-[#4a7c59]">
                {future.length}/{MAX_HISTORY_ACTIONS}
              </Badge>
            </Button>
          </div>
          <Button onClick={resetGame} variant="outline" className="border-[#ff8a5c] text-[#ff8a5c] hover:bg-[#fff1e6]">
            Reset
          </Button>
        </div>
      </Card>

      <Dialog open={showWinDialog} onOpenChange={setShowWinDialog}>
        <DialogContent className="sm:max-w-md bg-white border-[#4a7c59]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl text-[#4a7c59]">
              <Trophy className="h-6 w-6 text-[#ff8a5c]" />
              Congratulations!
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-[#4a7c59]">
              You've successfully completed the DigitShift Challenge!
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#ffeeee] p-6 rounded-lg text-center">
            <p className="text-xl font-semibold text-[#4a7c59]">
              You won in {formatTime(time)} with {moves} moves!
            </p>
            <div className="mt-6 flex justify-center">
              <Button onClick={resetGame} className="bg-[#ff8a5c] hover:bg-[#ff7b4a] text-white border-none">
                Play Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

