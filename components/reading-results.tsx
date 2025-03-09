"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, Trophy, Star, TrendingUp } from "lucide-react"
import { ReadingChart } from "@/components/reading-chart"
import { MockSessionRecorder } from "@/components/mock-session-recorder"

interface ReadingResultsProps {
  scores: number[]
  attempt: number
  level: string
  onNext: () => void
}

export function ReadingResults({ scores, attempt, level, onNext }: ReadingResultsProps) {
  const currentScore = scores[scores.length - 1] || 0
  const previousScore = scores.length > 1 ? scores[scores.length - 2] : 0
  const improved = scores.length > 1 && currentScore > previousScore
  const improvement = improved ? currentScore - previousScore : 0

  // Calculate errors (roughly 10-20% of words for demonstration)
  const estimatedErrors = Math.round(currentScore * (Math.random() * 0.1 + 0.1))

  // Calculate appropriate message based on score and improvement
  const getMessage = () => {
    if (improved) {
      if (improvement >= 10) return "Incredible improvement!"
      if (improvement >= 5) return "Amazing progress!"
      return "You're getting better!"
    } else if (scores.length === 1) {
      if (currentScore >= 50) return "Fantastic start!"
      if (currentScore >= 30) return "Great job reading!"
      return "Good effort!"
    } else {
      return "Keep practicing! You can do it!"
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Your Results</h1>
        <p className="text-lg text-muted-foreground">
          Level: {level} | Attempt {attempt} of 3
        </p>
      </div>

      {/* Record this session for the progress page */}
      <MockSessionRecorder level={level} attempt={attempt} score={currentScore} errors={estimatedErrors} />

      <Card className="w-full border-2 border-primary/20 shadow-md mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            {improved ? <Trophy className="h-6 w-6 text-yellow-500" /> : <Star className="h-6 w-6 text-primary" />}
            {getMessage()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">{currentScore}</div>
            <p className="text-muted-foreground">Words read correctly in one minute</p>

            {improved && (
              <div className="mt-2 text-green-600 font-medium flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />+{improvement} words from last attempt!
              </div>
            )}
          </div>

          {scores.length > 1 && (
            <div className="h-[200px] mt-8">
              <ReadingChart data={scores} />
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Reading Speed</div>
              <div className="text-xl font-bold text-primary">
                {currentScore >= 100
                  ? "Very Fast"
                  : currentScore >= 70
                    ? "Fast"
                    : currentScore >= 40
                      ? "Good"
                      : "Developing"}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Accuracy</div>
              <div className="text-xl font-bold text-primary">
                {estimatedErrors === 0
                  ? "Perfect"
                  : estimatedErrors <= 3
                    ? "Excellent"
                    : estimatedErrors <= 8
                      ? "Good"
                      : "Developing"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={onNext} className="gap-2">
        {attempt < 3 ? "Try Again" : "Next Reading"}
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}

