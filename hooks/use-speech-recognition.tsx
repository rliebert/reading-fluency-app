"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechRecognitionResult {
  transcript: string
  listening: boolean
  startListening: () => Promise<void>
  stopListening: () => void
  resetTranscript: () => void
  hasRecognitionSupport: boolean
}

// Define the SpeechRecognition types for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function useSpeechRecognition(): SpeechRecognitionResult {
  const [transcript, setTranscript] = useState("")
  const [listening, setListening] = useState(false)
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition and if we're in a secure context
    if (typeof window !== 'undefined' && 
        (window.SpeechRecognition || window.webkitSpeechRecognition) && 
        (window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      
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
    } else {
      console.warn("Speech Recognition is not supported in this browser or requires a secure context (HTTPS)")
      setHasRecognitionSupport(false)
    }

    return () => {
      if (recognition) {
        try {
          recognition.stop()
        } catch (e) {
          console.error("Error stopping speech recognition:", e)
        }
      }
    }
  }, [])

  const startListening = useCallback(async () => {
    if (!recognition) {
      console.error("Speech recognition not initialized")
      return
    }

    if (listening) {
      return // Already listening
    }

    try {
      // Request microphone permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true })
      }
      
      recognition.start()
      setListening(true)
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setListening(false)
    }
  }, [recognition, listening])

  const stopListening = useCallback(() => {
    if (recognition && listening) {
      try {
        recognition.stop()
      } catch (e) {
        console.error("Error stopping speech recognition:", e)
      }
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

