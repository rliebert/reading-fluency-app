"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Settings, BookOpen, Users, Volume2 } from "lucide-react"
import { OpenAIVoiceSelector, type OpenAIVoiceSettings } from "@/components/openai-voice-selector"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [speechRate, setSpeechRate] = useState(80)
  const [darkMode, setDarkMode] = useState(false)
  const [soundEffects, setSoundEffects] = useState(true)
  const [animations, setAnimations] = useState(true)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [voiceSettings, setVoiceSettings] = useState<OpenAIVoiceSettings>(() => {
    // Try to load from localStorage
    const savedSettings = localStorage.getItem("openaiVoiceSettings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        return {
          voice: parsed.voice || "nova",
          speed: parsed.speed || 1.0,
          model: parsed.model || "tts-1",
          teacherPersonality: parsed.teacherPersonality || "enthusiastic",
          preferredAccent: parsed.preferredAccent || "american",
        }
      } catch (e) {
        console.error("Error parsing voice settings:", e)
      }
    }

    // Default settings
    return {
      voice: "nova",
      speed: 1.0,
      model: "tts-1",
      teacherPersonality: "enthusiastic",
      preferredAccent: "american",
    }
  })

  // Save voice settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("openaiVoiceSettings", JSON.stringify(voiceSettings))
  }, [voiceSettings])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

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

  // Get the personality name
  const getPersonalityName = () => {
    switch (voiceSettings.teacherPersonality) {
      case "enthusiastic":
        return "Enthusiastic Teacher"
      case "gentle":
        return "Gentle Guide"
      case "playful":
        return "Playful Friend"
      case "storyteller":
        return "Animated Storyteller"
      default:
        return "Teacher"
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
    <div
      className={`flex min-h-screen flex-col items-center justify-center bg-gradient-to-b ${
        darkMode ? "dark from-gray-900 to-gray-800" : "from-blue-50 to-purple-50"
      } p-4`}
    >
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Settings</h1>
          <div className="w-[73px]"></div> {/* Spacer for centering */}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General Settings
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Reading Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="border-2 border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">General Settings</CardTitle>
                <CardDescription>Customize the app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dark-mode" className="text-base">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">Switch to dark theme for reduced eye strain</p>
                  </div>
                  <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sound-effects" className="text-base">
                      Sound Effects
                    </Label>
                    <p className="text-sm text-muted-foreground">Enable sound effects for achievements and feedback</p>
                  </div>
                  <Switch id="sound-effects" checked={soundEffects} onCheckedChange={setSoundEffects} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="animations" className="text-base">
                      Animations
                    </Label>
                    <p className="text-sm text-muted-foreground">Enable animations for rewards and transitions</p>
                  </div>
                  <Switch id="animations" checked={animations} onCheckedChange={setAnimations} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-advance" className="text-base">
                      Auto-Advance Segments
                    </Label>
                    <p className="text-sm text-muted-foreground">Automatically move to the next segment when reading</p>
                  </div>
                  <Switch id="auto-advance" checked={true} onCheckedChange={() => {}} />
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label className="text-base flex items-center gap-2">
                        <Volume2 className="h-4 w-4" />
                        Teacher Voice Settings
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Customize how the reading assistant sounds and teaches
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowVoiceSettings(true)}>
                      <Settings className="h-4 w-4" />
                      Voice Settings
                    </Button>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getPersonalityEmoji()}</span>
                        <span className="font-medium">{getPersonalityName()}</span>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Speed: {voiceSettings.speed.toFixed(1)}x</span>
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground flex justify-between">
                      <span>Voice: {voiceSettings.voice}</span>
                      <span>{getAccentName()} accent</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="border-2 border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Reading Content</CardTitle>
                <CardDescription>Manage reading passages and difficulty levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="grade-level" className="text-base">
                    Grade Level
                  </Label>
                  <Select defaultValue="k-1">
                    <SelectTrigger id="grade-level">
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="k-1">Kindergarten - 1st Grade</SelectItem>
                      <SelectItem value="1-2">1st - 2nd Grade</SelectItem>
                      <SelectItem value="2-3">2nd - 3rd Grade</SelectItem>
                      <SelectItem value="3-4">3rd - 4th Grade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reading-topic" className="text-base">
                    Reading Topics
                  </Label>
                  <Select defaultValue="all">
                    <SelectTrigger id="reading-topic">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      <SelectItem value="animals">Animals</SelectItem>
                      <SelectItem value="nature">Nature</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-passage" className="text-base">
                    Add Custom Reading Passage
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">Enter a custom reading passage for practice</p>
                  <textarea
                    id="custom-passage"
                    className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
                    placeholder="Enter a short reading passage here..."
                  />
                  <Button className="mt-2">Save Passage</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-2">Teacher or Parent Access</p>
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            Manage Student Accounts
          </Button>
        </div>
      </div>

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

