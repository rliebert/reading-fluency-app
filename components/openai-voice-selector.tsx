"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Volume2, VolumeX, X } from "lucide-react"
import { speakWithOpenAI } from "@/lib/openai-tts"

export interface OpenAIVoiceSettings {
  voice: string
  speed: number
  model: string
  teacherPersonality: string
  preferredAccent?: "american" | "british" | "australian"
}

interface OpenAIVoiceSelectorProps {
  settings: OpenAIVoiceSettings
  onSettingsChange: (settings: OpenAIVoiceSettings) => void
  onClose: () => void
}

const OPENAI_VOICES = [
  { id: "alloy", name: "Alloy", description: "Neutral, balanced voice" },
  { id: "echo", name: "Echo", description: "Deep, soft male voice" },
  { id: "fable", name: "Fable", description: "Male narrative voice" },
  { id: "onyx", name: "Onyx", description: "Deep, authoritative male voice" },
  { id: "nova", name: "Nova", description: "Energetic female voice" },
  { id: "shimmer", name: "Shimmer", description: "High-pitched female voice" },
]

const OPENAI_MODELS = [
  { id: "tts-1", name: "Standard", description: "Good quality voice" },
  { id: "tts-1-hd", name: "HD", description: "Higher quality voice" },
]

const TEACHER_PERSONALITIES = [
  {
    id: "enthusiastic",
    name: "Enthusiastic Teacher",
    description: "Very energetic and encouraging",
    emoji: "🌟",
  },
  {
    id: "gentle",
    name: "Gentle Guide",
    description: "Calm, patient, and supportive",
    emoji: "🌈",
  },
  {
    id: "playful",
    name: "Playful Friend",
    description: "Fun, silly, and engaging",
    emoji: "🎮",
  },
  {
    id: "storyteller",
    name: "Animated Storyteller",
    description: "Dramatic and expressive",
    emoji: "📚",
  },
]

const ACCENT_OPTIONS = [
  { id: "american", name: "American", description: "Standard American accent" },
  { id: "british", name: "British", description: "British accent" },
  { id: "australian", name: "Australian", description: "Australian accent" },
]

export function OpenAIVoiceSelector({ settings, onSettingsChange, onClose }: OpenAIVoiceSelectorProps) {
  const [voice, setVoice] = useState(settings.voice || "nova")
  const [speed, setSpeed] = useState(settings.speed || 1.0)
  const [model, setModel] = useState(settings.model || "tts-1")
  const [teacherPersonality, setTeacherPersonality] = useState(settings.teacherPersonality || "enthusiastic")
  const [preferredAccent, setPreferredAccent] = useState<"american" | "british" | "australian">(
    settings.preferredAccent || "american",
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState("voice")
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Preview the selected voice with the selected personality
  const previewVoice = async () => {
    try {
      setIsPlaying(true)

      // Get sample text based on personality
      let sampleText = "This is how I will sound when reading to you."

      switch (teacherPersonality) {
        case "enthusiastic":
          sampleText = "Wow! Great job reading that word! You're doing AMAZING!"
          break
        case "gentle":
          sampleText = "That's right, very good. You're doing so well with your reading."
          break
        case "playful":
          sampleText = "Super duper reading! Let's try another fun word together!"
          break
        case "storyteller":
          sampleText = "Once upon a time, there was an awesome reader just like you!"
          break
      }

      // Use the OpenAI TTS API to generate and play the audio
      await speakWithOpenAI({
        text: sampleText,
        voice,
        model,
        speed,
        teacherPersonality,
        preferredAccent,
      })

      setIsPlaying(false)
    } catch (error) {
      console.error("Error previewing voice:", error)
      setIsPlaying(false)
    }
  }

  // Stop preview
  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    window.speechSynthesis.cancel()
    setIsPlaying(false)
  }

  // Save voice settings
  const saveSettings = () => {
    onSettingsChange({
      voice,
      speed,
      model,
      teacherPersonality,
      preferredAccent,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-1">Voice Settings</h2>
          <p className="text-sm text-muted-foreground">
            Customize how the reading assistant sounds when speaking to you.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="voice">Voice</TabsTrigger>
            <TabsTrigger value="personality">Teacher Style</TabsTrigger>
            <TabsTrigger value="accent">Accent</TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-6">
            <div className="space-y-3">
              <Label>OpenAI Voice</Label>
              <RadioGroup value={voice} onValueChange={setVoice} className="grid grid-cols-2 gap-2">
                {OPENAI_VOICES.map((v) => (
                  <div key={v.id} className="flex items-start space-x-2 border rounded-md p-2">
                    <RadioGroupItem value={v.id} id={`voice-${v.id}`} className="mt-1" />
                    <div>
                      <Label htmlFor={`voice-${v.id}`} className="font-medium">
                        {v.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{v.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Voice Quality</Label>
              <RadioGroup value={model} onValueChange={setModel} className="grid grid-cols-2 gap-2">
                {OPENAI_MODELS.map((m) => (
                  <div key={m.id} className="flex items-start space-x-2 border rounded-md p-2">
                    <RadioGroupItem value={m.id} id={`model-${m.id}`} className="mt-1" />
                    <div>
                      <Label htmlFor={`model-${m.id}`} className="font-medium">
                        {m.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="speed">Speed: {speed.toFixed(1)}x</Label>
              </div>
              <Slider
                id="speed"
                min={0.5}
                max={2.0}
                step={0.1}
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
              />
            </div>
          </TabsContent>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-700">
              <strong>Note:</strong> This is a simulation of OpenAI's TTS voices. In a real implementation, the actual
              OpenAI TTS API would provide much more distinct voice differences. The real voices have unique
              characteristics that can't be fully replicated in this demo.
            </p>
          </div>

          <TabsContent value="personality" className="space-y-6">
            <div className="space-y-3">
              <Label>Teacher Personality</Label>
              <div className="grid grid-cols-1 gap-2">
                {TEACHER_PERSONALITIES.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-start space-x-3 border rounded-md p-3 cursor-pointer transition-colors ${
                      teacherPersonality === p.id ? "border-primary bg-primary/5" : "hover:border-primary/50"
                    }`}
                    onClick={() => setTeacherPersonality(p.id)}
                  >
                    <div className="text-2xl mt-1">{p.emoji}</div>
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <p className="text-sm text-muted-foreground">{p.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-muted/30 rounded-md">
                <p className="text-sm">
                  The teacher personality affects how words are spoken, adding enthusiasm, gentleness, or playfulness to
                  match different teaching styles.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accent" className="space-y-6">
            <div className="space-y-3">
              <Label>Preferred Accent</Label>
              <RadioGroup
                value={preferredAccent}
                onValueChange={(value) => setPreferredAccent(value as "american" | "british" | "australian")}
                className="grid grid-cols-1 gap-2"
              >
                {ACCENT_OPTIONS.map((a) => (
                  <div
                    key={a.id}
                    className={`flex items-start space-x-3 border rounded-md p-3 ${
                      preferredAccent === a.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <RadioGroupItem value={a.id} id={`accent-${a.id}`} className="mt-1" />
                    <div>
                      <Label htmlFor={`accent-${a.id}`} className="font-medium">
                        {a.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">{a.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              <div className="mt-4 p-3 bg-muted/30 rounded-md">
                <p className="text-sm">
                  Choose the accent that will be most familiar and helpful for your students. Standard American accent
                  is recommended for most U.S. classrooms.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center pt-6">
          {!isPlaying ? (
            <Button onClick={previewVoice} className="gap-2">
              <Volume2 className="h-4 w-4" />
              Preview Voice
            </Button>
          ) : (
            <Button onClick={stopPreview} variant="secondary" className="gap-2">
              <VolumeX className="h-4 w-4" />
              Stop Preview
            </Button>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveSettings}>Save Settings</Button>
        </div>
      </div>
    </div>
  )
}

