"use client"

import { useState, useEffect, useCallback } from "react"

interface SpeechRecognitionResult {
  transcript: string
  listening: boolean
  startListening: () => Promise<void>
  stopListening: () => void
  resetTranscript: () => void
  hasRecognitionSupport: boolean
  lastError: string | null
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
  const [lastError, setLastError] = useState<string | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    console.log("Initializing speech recognition...")
    
    // Check if browser supports speech recognition and if we're in a secure context
    const isSecureContext = typeof window !== 'undefined' && 
      (window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost');
    
    const hasSpeechRecognition = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    console.log(`Secure context: ${isSecureContext}, Speech Recognition API available: ${!!hasSpeechRecognition}`);
    
    if (hasSpeechRecognition && isSecureContext) {
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
        console.log("Speech recognition result received", event.results.length);
        let currentTranscript = ""

        for (let i = 0; i < event.results.length; i++) {
          // Use the most confident result
          currentTranscript += event.results[i][0].transcript
        }

        setTranscript(currentTranscript)
      }

      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setLastError(`Error: ${event.error}`)

        // If we get a "no-speech" error, don't stop listening
        if (event.error !== "no-speech") {
          setListening(false)
        }
      }

      recognitionInstance.onend = () => {
        console.log("Speech recognition ended, listening state:", listening);
        // If we're still supposed to be listening, restart
        if (listening) {
          try {
            console.log("Restarting speech recognition...");
            recognitionInstance.start()
          } catch (e) {
            console.error("Error restarting speech recognition:", e)
            setLastError(`Restart error: ${e}`)
            setListening(false)
          }
        } else {
          setListening(false)
        }
      }

      recognitionInstance.onstart = () => {
        console.log("Speech recognition started successfully");
      }

      setRecognition(recognitionInstance)
    } else {
      console.warn("Speech Recognition is not supported in this browser or requires a secure context (HTTPS)")
      setLastError("Speech Recognition not supported or not in secure context")
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
    console.log("Starting speech recognition...");
    
    if (!recognition) {
      console.error("Speech recognition not initialized")
      setLastError("Recognition not initialized")
      return
    }

    if (listening) {
      console.log("Already listening, no need to start again");
      return // Already listening
    }

    try {
      // Request microphone permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("Requesting microphone permission...");
        await navigator.mediaDevices.getUserMedia({ audio: true })
        console.log("Microphone permission granted");
      }
      
      console.log("Starting speech recognition instance...");
      recognition.start()
      setListening(true)
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setLastError(`Start error: ${error}`)
      setListening(false)
    }
  }, [recognition, listening])

  const stopListening = useCallback(() => {
    console.log("Stopping speech recognition...");
    if (recognition && listening) {
      try {
        recognition.stop()
      } catch (e) {
        console.error("Error stopping speech recognition:", e)
        setLastError(`Stop error: ${e}`)
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
    lastError
  }
}

