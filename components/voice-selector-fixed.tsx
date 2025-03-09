"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Volume2, VolumeX } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export interface VoiceSettings {
  voice: SpeechSynthesisVoice | null
  rate: number
  pitch: number
  volume: number
  description: string
}

interface VoiceSelectorProps {
  settings: VoiceSettings
  onSettingsChange: (settings: VoiceSettings) => void
}

export function VoiceSelector({ settings, onSettingsChange }: VoiceSelectorProps) {
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("")
  const [voiceDescription, setVoiceDescription] = useState(settings.description || "")
  const [rate, setRate] = useState(settings.rate)
  const [pitch, setPitch] = useState(settings.pitch)
  const [volume, setVolume] = useState(settings.volume)
  const [isPlaying, setIsPlaying] = useState(false)
  const [voiceType, setVoiceType] = useState<"select" | "describe">(settings.description ? "describe" : "select")
  const [isOpen, setIsOpen] = useState(false)

  // Load available voices
  useEffect(() => {
    function loadVoices() {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setAvailableVoices(voices)

        // Set selected voice if we have one
        if (settings.voice) {
          setSelectedVoiceURI(settings.voice.voiceURI)
        } else if (voices.length) {
          // Find a good default voice - prefer English voices
          const englishVoices = voices.filter((v) => v.lang.startsWith("en"))
          const defaultVoice = englishVoices.length > 0 ? englishVoices[0] : voices[0]
          setSelectedVoiceURI(defaultVoice.voiceURI)

          // Update settings with default voice
          onSettingsChange({
            ...settings,
            voice: defaultVoice,
          })
        }
      }
    }

    // Load voices immediately if available
    loadVoices()

    // Chrome loads voices asynchronously, so we need this event
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [settings, onSettingsChange])

  // Preview the selected voice
  const previewVoice = () => {
    if (!window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance("This is how I will sound when reading to you.")

    if (voiceType === "select" && selectedVoiceURI) {
      const voice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI)
      if (voice) utterance.voice = voice
    }

    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    utterance.onstart = () => setIsPlaying(true)
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)

    window.speechSynthesis.speak(utterance)
  }

  // Stop preview
  const stopPreview = () => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
  }

  // Save voice settings
  const saveSettings = () => {
    let voice = null

    if (voiceType === "select") {
      voice = availableVoices.find((v) => v.voiceURI === selectedVoiceURI) || null
    }

    onSettingsChange({
      voice,
      rate,
      pitch,
      volume,
      description: voiceType === "describe" ? voiceDescription : "",
    })

    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Volume2 className="h-4 w-4" />
          Voice Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Voice Settings</DialogTitle>
          <DialogDescription>Customize how the reading assistant sounds when speaking to you.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup
            value={voiceType}
            onValueChange={(value) => setVoiceType(value as "select" | "describe")}
            className="flex flex-col space-y-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="select" id="select-voice" />
              <Label htmlFor="select-voice">Select a voice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="describe" id="describe-voice" />
              <Label htmlFor="describe-voice">Describe a voice</Label>
            </div>
          </RadioGroup>

          {voiceType === "select" && (
            <div className="space-y-2">
              <Label htmlFor="voice-select">Available Voices</Label>
              <select
                id="voice-select"
                className="w-full p-2 border rounded-md"
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
              >
                {availableVoices.map((voice) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {voice.name} ({voice.lang}) {voice.localService ? "(Local)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {voiceType === "describe" && (
            <div className="space-y-2">
              <Label htmlFor="voice-description">Describe the voice you want</Label>
              <Input
                id="voice-description"
                placeholder="e.g., A friendly teacher with a calm voice"
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Note: This is a simulation. In a real app, this description would be used to select an appropriate voice
                from a more extensive voice library or AI voice generator.
              </p>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label htmlFor="rate">Speed: {rate.toFixed(1)}x</Label>
              </div>
              <Slider
                id="rate"
                min={0.5}
                max={2}
                step={0.1}
                value={[rate]}
                onValueChange={(value) => setRate(value[0])}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <Label htmlFor="pitch">Pitch: {pitch.toFixed(1)}</Label>
              </div>
              <Slider
                id="pitch"
                min={0.5}
                max={2}
                step={0.1}
                value={[pitch]}
                onValueChange={(value) => setPitch(value[0])}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <Label htmlFor="volume">Volume: {Math.round(volume * 100)}%</Label>
              </div>
              <Slider
                id="volume"
                min={0}
                max={1}
                step={0.1}
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
              />
            </div>
          </div>

          <div className="flex justify-center pt-2">
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
        </div>

        <DialogFooter>
          <Button onClick={saveSettings}>Save Voice Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

