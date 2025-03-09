"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { BugPlay, Gauge, Zap, Award, Brain, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TestingUtilityProps {
  onSimulateReading: (options: SimulationOptions) => void
  currentPassageLevel: string
  currentAttempt: number
  speechRecognitionSupported?: boolean
}

export interface SimulationOptions {
  wordsPerMinute: number
  errorRate: number
  improvementFactor: number
  simulationType: "normal" | "perfect" | "struggling" | "improving"
}

export function TestingUtility({ 
  onSimulateReading, 
  currentPassageLevel, 
  currentAttempt,
  speechRecognitionSupported = true
}: TestingUtilityProps) {
  const [wordsPerMinute, setWordsPerMinute] = useState(40)
  const [errorRate, setErrorRate] = useState(10)
  const [improvementFactor, setImprovementFactor] = useState(5)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false) // Always start collapsed

  // Apply preset settings
  const applyPreset = (preset: "normal" | "perfect" | "struggling" | "improving") => {
    setActivePreset(preset)

    switch (preset) {
      case "perfect":
        setWordsPerMinute(60)
        setErrorRate(0)
        setImprovementFactor(0)
        break
      case "struggling":
        setWordsPerMinute(20)
        setErrorRate(30)
        setImprovementFactor(0)
        break
      case "improving":
        setWordsPerMinute(30 + currentAttempt * 5)
        setErrorRate(Math.max(5, 20 - currentAttempt * 5))
        setImprovementFactor(5)
        break
      case "normal":
      default:
        setWordsPerMinute(40)
        setErrorRate(10)
        setImprovementFactor(5)
        break
    }
  }

  // Reset active preset when sliders are manually adjusted
  useEffect(() => {
    setActivePreset(null)
  }, [wordsPerMinute, errorRate, improvementFactor])

  const handleSimulate = () => {
    onSimulateReading({
      wordsPerMinute,
      errorRate,
      improvementFactor,
      simulationType: (activePreset as any) || "normal",
    })
  }

  // Run a quick test based on current attempt
  const runQuickTest = () => {
    if (currentAttempt === 1) {
      applyPreset("struggling")
      setTimeout(() => handleSimulate(), 100)
    } else if (currentAttempt === 2) {
      applyPreset("improving")
      setTimeout(() => handleSimulate(), 100)
    } else {
      applyPreset("perfect")
      setTimeout(() => handleSimulate(), 100)
    }
  }

  if (!expanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="default"
          size="sm"
          className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
          onClick={() => setExpanded(true)}
        >
          <BugPlay className="h-4 w-4 mr-2" />
          Test Mode
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="border-2 border-yellow-500 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm flex items-center">
              <BugPlay className="h-4 w-4 mr-2 text-yellow-500" />
              Testing Utility
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setExpanded(false)}>
              ×
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current: {currentPassageLevel} - Attempt {currentAttempt}
          </p>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {!speechRecognitionSupported && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700">
                  Speech recognition is not available. Use Test Mode to simulate reading.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-2">
            <Badge
              variant={activePreset === "normal" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => applyPreset("normal")}
            >
              <Brain className="h-3 w-3 mr-1" />
              Normal
            </Badge>
            <Badge
              variant={activePreset === "perfect" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => applyPreset("perfect")}
            >
              <Award className="h-3 w-3 mr-1" />
              Perfect
            </Badge>
            <Badge
              variant={activePreset === "struggling" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => applyPreset("struggling")}
            >
              <Gauge className="h-3 w-3 mr-1" />
              Struggling
            </Badge>
            <Badge
              variant={activePreset === "improving" ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => applyPreset("improving")}
            >
              <Zap className="h-3 w-3 mr-1" />
              Improving
            </Badge>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="wpm" className="text-xs">
                Words Per Minute: {wordsPerMinute}
              </Label>
              <Gauge className="h-3 w-3 text-muted-foreground" />
            </div>
            <Slider
              id="wpm"
              min={10}
              max={100}
              step={5}
              value={[wordsPerMinute]}
              onValueChange={(value) => setWordsPerMinute(value[0])}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="error-rate" className="text-xs">
                Error Rate: {errorRate}%
              </Label>
            </div>
            <Slider
              id="error-rate"
              min={0}
              max={50}
              step={5}
              value={[errorRate]}
              onValueChange={(value) => setErrorRate(value[0])}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <Label htmlFor="improvement" className="text-xs">
                Improvement: {improvementFactor > 0 ? "+" : ""}
                {improvementFactor} words
              </Label>
              <Zap className="h-3 w-3 text-muted-foreground" />
            </div>
            <Slider
              id="improvement"
              min={-10}
              max={20}
              step={1}
              value={[improvementFactor]}
              onValueChange={(value) => setImprovementFactor(value[0])}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button size="sm" variant="default" onClick={handleSimulate} className="text-xs">
              Simulate Reading
            </Button>
            <Button size="sm" variant="outline" onClick={runQuickTest} className="text-xs">
              Smart Test
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            <p>Smart Test: Automatically runs the appropriate test for attempt {currentAttempt}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

