"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, CheckCircle2, ChevronRight, Settings, ArrowLeft } from "lucide-react"
import { OpenAIVoiceSelector, type OpenAIVoiceSettings } from "@/components/openai-voice-selector"
import { speakWithOpenAI } from "@/lib/openai-tts"
import Link from "next/link"

interface ReadingFeedbackProps {
  errors: string[]
  onComplete: () => void
}

// Default voice settings
const defaultVoiceSettings: OpenAIVoiceSettings = {
  voice: "nova",
  speed: 1.0,
  model: "tts-1",
  teacherPersonality: "enthusiastic",
  preferredAccent: "american",
}

export function ReadingFeedback({ errors, onComplete }: ReadingFeedbackProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasSpoken, setHasSpoken] = useState(false)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<OpenAIVoiceSettings>(defaultVoiceSettings)

  // Load settings from localStorage only on the client side
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem("openaiVoiceSettings")
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setVoiceSettings({
            voice: parsed.voice || defaultVoiceSettings.voice,
            speed: parsed.speed || defaultVoiceSettings.speed,
            model: parsed.model || defaultVoiceSettings.model,
            teacherPersonality: parsed.teacherPersonality || defaultVoiceSettings.teacherPersonality,
            preferredAccent: parsed.preferredAccent || defaultVoiceSettings.preferredAccent,
          })
        } catch (e) {
          console.error("Error parsing voice settings:", e)
        }
      }
    }
  }, [])

  // Save voice settings to localStorage when they change
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      localStorage.setItem("openaiVoiceSettings", JSON.stringify(voiceSettings))
    }
  }, [voiceSettings])

  // Clean up speech synthesis on unmount
  useEffect(() => {
    if (errors.length === 0) {
      onComplete()
      return
    }

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [errors, onComplete])

  const speakWord = async (word: string) => {
    try {
      setIsPlaying(true)

      await speakWithOpenAI({
        text: word,
        voice: voiceSettings.voice,
        model: voiceSettings.model,
        speed: voiceSettings.speed,
        teacherPersonality: voiceSettings.teacherPersonality,
        preferredAccent: voiceSettings.preferredAccent,
      })

      setIsPlaying(false)
      setHasSpoken(true)
    } catch (error) {
      console.error("Error speaking word:", error)
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    if (currentWordIndex < errors.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setHasSpoken(false)
    } else {
      onComplete()
    }
  }

  const currentWord = errors[currentWordIndex]

  // Get the personality emoji
  const getPersonalityEmoji = () => {
    switch (voiceSettings.teacherPersonality) {
      case "enthusiastic":
        return "🌟"
      case "gentle":
        return "🌈"
      case "playful":
        return "🎮"
      case "storyteller":
        return "📚"
      default:
        return "👩‍🏫"
    }
  }

  // Get the accent name
  const getAccentName = () => {
    switch (voiceSettings.preferredAccent) {
      case "american":
        return "American"
      case "british":
        return "British"
      case "australian":
        return "Australian"
      default:
        return "American"
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 w-full">
        <div className="flex items-center justify-between mb-2">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Let's Practice</h1>
          <div className="w-[73px]"></div> {/* Spacer for centering */}
        </div>
        <p className="text-lg text-muted-foreground text-center">Let's work on some words you found tricky</p>
      </div>

      <div className="mb-4 flex justify-between w-full items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{getPersonalityEmoji()}</span>
          <span className="capitalize">
            {voiceSettings.teacherPersonality} Teacher ({getAccentName()})
          </span>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowVoiceSettings(true)}>
          <Settings className="h-4 w-4" />
          Voice Settings
        </Button>
      </div>

      {showVoiceSettings ? null : (
        <div className="w-full mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700 text-center">
            Using OpenAI's TTS API for voice generation
          </p>
        </div>
      )}

      <Card className="w-full border-2 border-primary/20 shadow-md mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-center">
            Word {currentWordIndex + 1} of {errors.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center">
          <div className="text-6xl font-bold text-primary mb-8 tracking-wide">{currentWord}</div>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Button size="lg" onClick={() => speakWord(currentWord)} disabled={isPlaying} className="gap-2">
              <Volume2 className="h-5 w-5" />
              Hear the Word
            </Button>

            <Button
              size="lg"
              variant={hasSpoken ? "default" : "outline"}
              onClick={handleNext}
              className="gap-2"
              disabled={!hasSpoken}
            >
              {currentWordIndex < errors.length - 1 ? (
                <>
                  Next Word <ChevronRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Continue <CheckCircle2 className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showVoiceSettings && (
        <OpenAIVoiceSelector
          settings={voiceSettings}
          onSettingsChange={setVoiceSettings}
          onClose={() => setShowVoiceSettings(false)}
        />
      )}
    </div>
  )
}

