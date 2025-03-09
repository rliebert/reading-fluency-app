"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechRecognitionResult {
  transcript: string
  listening: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  hasRecognitionSupport: boolean
}

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [transcript, setTranscript] = useState("")
  const [listening, setListening] = useState(false)
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setHasRecognitionSupport(true)

      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = "en-US"

      // Increase maxAlternatives to improve accuracy
      recognitionInstance.maxAlternatives = 3

      recognitionInstance.onresult = (event: any) => {
        let currentTranscript = ""

        for (let i = 0; i < event.results.length; i++) {
          // Use the most confident result
          currentTranscript += event.results[i][0].transcript
        }

        setTranscript(currentTranscript)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)

        // If we get a "no-speech" error, don't stop listening
        if (event.error !== "no-speech") {
          setListening(false)
        }
      }

      recognitionInstance.onend = () => {
        // If we're still supposed to be listening, restart
        if (listening) {
          try {
            recognitionInstance.start()
          } catch (e) {
            console.error("Error restarting speech recognition:", e)
            setListening(false)
          }
        } else {
          setListening(false)
        }
      }

      setRecognition(recognitionInstance)
    }

    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [listening])

  const startListening = useCallback(() => {
    if (recognition && !listening) {
      try {
        recognition.start()
        setListening(true)
      } catch (error) {
        console.error("Error starting speech recognition:", error)
      }
    }
  }, [recognition, listening])

  const stopListening = useCallback(() => {
    if (recognition && listening) {
      recognition.stop()
      setListening(false)
    }
  }, [recognition, listening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
  }, [])

  return {
    transcript,
    listening,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
  }
}

