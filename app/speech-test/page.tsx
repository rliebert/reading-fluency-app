"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SpeechTestPage() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [secureContext, setSecureContext] = useState<boolean | null>(null)
  const [permission, setPermission] = useState<PermissionState | null>(null)
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    // Check if browser supports speech recognition
    const hasSpeechRecognition = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    setSupported(!!hasSpeechRecognition)
    addLog(`Speech Recognition API supported: ${!!hasSpeechRecognition}`)
    
    // Check if in secure context
    const isSecureContext = typeof window !== 'undefined' && 
      (window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost');
    
    setSecureContext(isSecureContext)
    addLog(`Secure context: ${isSecureContext}`)
    
    // Check microphone permission if available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          setPermission(permissionStatus.state)
          addLog(`Microphone permission: ${permissionStatus.state}`)
          
          permissionStatus.onchange = () => {
            setPermission(permissionStatus.state)
            addLog(`Microphone permission changed to: ${permissionStatus.state}`)
          }
        })
        .catch(err => {
          addLog(`Error checking microphone permission: ${err}`)
        })
    }
    
    // Initialize speech recognition if supported
    if (hasSpeechRecognition) {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognition.maxAlternatives = 1
        
        recognition.onstart = () => {
          setIsListening(true)
          addLog("Recognition started")
        }
        
        recognition.onresult = (event: any) => {
          addLog(`Result received: ${event.results.length} results`)
          let currentTranscript = ""
          
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          
          setTranscript(currentTranscript)
          addLog(`Transcript updated: "${currentTranscript}"`)
        }
        
        recognition.onerror = (event: any) => {
          setError(`Error: ${event.error}`)
          addLog(`Error occurred: ${event.error}`)
          
          if (event.error !== "no-speech") {
            setIsListening(false)
          }
        }
        
        recognition.onend = () => {
          addLog("Recognition ended")
          setIsListening(false)
        }
        
        setRecognitionInstance(recognition)
        addLog("Recognition instance created successfully")
      } catch (err) {
        setError(`Failed to initialize: ${err}`)
        addLog(`Failed to initialize speech recognition: ${err}`)
      }
    }
    
    return () => {
      if (recognitionInstance) {
        try {
          recognitionInstance.stop()
          addLog("Recognition stopped on cleanup")
        } catch (err) {
          addLog(`Error stopping recognition on cleanup: ${err}`)
        }
      }
    }
  }, [])
  
  const startListening = async () => {
    if (!recognitionInstance) {
      setError("Recognition not initialized")
      addLog("Failed to start: Recognition not initialized")
      return
    }
    
    try {
      // Request microphone permission explicitly
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        addLog("Requesting microphone permission...")
        await navigator.mediaDevices.getUserMedia({ audio: true })
        addLog("Microphone permission granted")
      }
      
      recognitionInstance.start()
      addLog("Recognition.start() called")
    } catch (err) {
      setError(`Start error: ${err}`)
      addLog(`Error starting recognition: ${err}`)
    }
  }
  
  const stopListening = () => {
    if (recognitionInstance && isListening) {
      try {
        recognitionInstance.stop()
        addLog("Recognition.stop() called")
      } catch (err) {
        setError(`Stop error: ${err}`)
        addLog(`Error stopping recognition: ${err}`)
      }
    }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Speech Recognition Test</h1>
          <div className="w-[73px]"></div> {/* Spacer for centering */}
        </div>
        
        <Card className="border-2 border-primary/20 shadow-md mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Speech Recognition Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/30">
                <div className={supported ? "text-green-500" : "text-red-500"}>
                  {supported ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium">API Support</p>
                  <p className="text-sm text-muted-foreground">
                    {supported ? "Supported" : "Not supported"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/30">
                <div className={secureContext ? "text-green-500" : "text-red-500"}>
                  {secureContext ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium">Secure Context</p>
                  <p className="text-sm text-muted-foreground">
                    {secureContext ? "Yes (required)" : "No (required)"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted/30">
                <div className={
                  permission === "granted" ? "text-green-500" : 
                  permission === "denied" ? "text-red-500" : "text-yellow-500"
                }>
                  {permission === "granted" ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-medium">Microphone Permission</p>
                  <p className="text-sm text-muted-foreground">
                    {permission || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center mt-6">
              <Button 
                onClick={startListening} 
                disabled={!supported || !secureContext || isListening}
                className="gap-2"
              >
                <Mic className="h-4 w-4" />
                Start Listening
              </Button>
              
              <Button 
                onClick={stopListening} 
                disabled={!isListening}
                variant="outline"
                className="gap-2"
              >
                Stop Listening
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Transcript:</p>
                {isListening && (
                  <span className="text-green-500 flex items-center gap-1 text-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Listening...
                  </span>
                )}
              </div>
              <p className="text-muted-foreground min-h-[1.5rem] p-2 bg-white/50 rounded border border-muted">
                {transcript || (isListening ? "Waiting for speech..." : "Not listening")}
              </p>
              {error && (
                <p className="text-xs text-red-500 mt-2">
                  Error: {error}
                </p>
              )}
            </div>
            
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Debug Logs:</p>
              <div className="bg-black/90 text-green-400 p-3 rounded-md text-xs font-mono h-48 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm">
          <p className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</p>
          <ul className="list-disc pl-5 space-y-1 text-yellow-700">
            <li>Speech recognition works best in Chrome, Edge, or other Chromium-based browsers</li>
            <li>Make sure you've allowed microphone access when prompted</li>
            <li>Speak clearly and at a normal volume</li>
            <li>Check that your microphone is working in other applications</li>
            <li>Try restarting your browser if issues persist</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 