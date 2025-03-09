"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressChart } from "@/components/progress-chart"
import { AchievementsList } from "@/components/achievements-list"
import { ChevronLeft, Trophy, BarChart3, Award } from "lucide-react"

// Mock data - in a real app, this would come from a database
const MOCK_PROGRESS_DATA = [
  { day: "Monday", score: 25 },
  { day: "Tuesday", score: 28 },
  { day: "Wednesday", score: 30 },
  { day: "Thursday", score: 35 },
  { day: "Friday", score: 40 },
]

const MOCK_ACHIEVEMENTS = [
  {
    id: 1,
    title: "First Reading",
    description: "Completed your first reading exercise",
    earned: true,
    date: "2023-05-01",
  },
  { id: 2, title: "Reading Streak", description: "Read for 3 days in a row", earned: true, date: "2023-05-03" },
  { id: 3, title: "Word Master", description: "Read 50 words correctly in one minute", earned: false },
  {
    id: 4,
    title: "Super Improver",
    description: "Improved your score 3 times in a row",
    earned: true,
    date: "2023-05-05",
  },
  { id: 5, title: "Reading Champion", description: "Completed all reading levels", earned: false },
]

// Mock session history for detailed view
const MOCK_SESSION_HISTORY = [
  {
    id: 1,
    date: "2023-05-01",
    level: "Kindergarten",
    attempts: [
      { attempt: 1, score: 20, errors: 8 },
      { attempt: 2, score: 25, errors: 5 },
      { attempt: 3, score: 28, errors: 3 },
    ],
  },
  {
    id: 2,
    date: "2023-05-02",
    level: "Kindergarten",
    attempts: [
      { attempt: 1, score: 25, errors: 6 },
      { attempt: 2, score: 30, errors: 4 },
      { attempt: 3, score: 32, errors: 3 },
    ],
  },
  {
    id: 3,
    date: "2023-05-03",
    level: "1st Grade",
    attempts: [
      { attempt: 1, score: 28, errors: 7 },
      { attempt: 2, score: 32, errors: 5 },
      { attempt: 3, score: 35, errors: 3 },
    ],
  },
  {
    id: 4,
    date: "2023-05-05",
    level: "1st Grade",
    attempts: [
      { attempt: 1, score: 32, errors: 5 },
      { attempt: 2, score: 36, errors: 3 },
      { attempt: 3, score: 40, errors: 2 },
    ],
  },
]

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("progress")
  const [sessionData, setSessionData] = useState(MOCK_SESSION_HISTORY)

  // Get data from localStorage if available (for test mode integration)
  useEffect(() => {
    const storedSessions = localStorage.getItem("readingSessionHistory")
    if (storedSessions) {
      try {
        const parsedSessions = JSON.parse(storedSessions)
        if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
          setSessionData([...parsedSessions, ...MOCK_SESSION_HISTORY])
        }
      } catch (e) {
        console.error("Error parsing stored sessions:", e)
      }
    }
  }, [])

  // Calculate best scores for display
  const bestScore = Math.max(...sessionData.flatMap((session) => session.attempts.map((attempt) => attempt.score)))

  // Calculate average score
  const averageScore = Math.round(
    sessionData
      .flatMap((session) => session.attempts.map((attempt) => attempt.score))
      .reduce((sum, score) => sum + score, 0) / sessionData.flatMap((session) => session.attempts).length,
  )

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">My Progress</h1>
          <div className="w-[73px]"></div> {/* Spacer for centering */}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Reading Progress
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card className="border-2 border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl">Weekly Reading Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ProgressChart data={MOCK_PROGRESS_DATA} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-4xl font-bold text-primary mb-1">{bestScore}</div>
                    <div className="text-sm text-muted-foreground">Highest Score</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="text-4xl font-bold text-primary mb-1">{averageScore}</div>
                    <div className="text-sm text-muted-foreground">Average Score</div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Recent Reading Sessions</h3>
                  <div className="space-y-3">
                    {sessionData.slice(-3).map((session) => (
                      <div key={session.id} className="bg-card border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{session.level}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(session.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          {session.attempts.map((attempt) => (
                            <div key={attempt.attempt} className="flex-1 bg-muted/30 rounded p-2 text-center">
                              <div className="text-xs text-muted-foreground mb-1">Attempt {attempt.attempt}</div>
                              <div className="text-lg font-medium">{attempt.score}</div>
                              <div className="text-xs text-muted-foreground">{attempt.errors} errors</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="border-2 border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Your Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AchievementsList achievements={MOCK_ACHIEVEMENTS} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Link href="/reading">
            <Button size="lg" className="gap-2">
              Continue Reading Practice
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

