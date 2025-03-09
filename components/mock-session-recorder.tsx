"use client"

import { useEffect } from "react"

interface MockSessionRecorderProps {
  level: string
  attempt: number
  score: number
  errors: number
}

export function MockSessionRecorder({ level, attempt, score, errors }: MockSessionRecorderProps) {
  useEffect(() => {
    // Only record completed attempts
    if (score > 0) {
      // Get existing sessions from localStorage
      const existingSessions = localStorage.getItem("readingSessionHistory")
      let sessions = []

      if (existingSessions) {
        try {
          sessions = JSON.parse(existingSessions)
        } catch (e) {
          console.error("Error parsing sessions:", e)
        }
      }

      // Check if we have a session for today
      const today = new Date().toISOString().split("T")[0]
      let todaySession = sessions.find((s: any) => s.date === today && s.level === level)

      if (todaySession) {
        // Update existing attempt or add new one
        const existingAttempt = todaySession.attempts.findIndex((a: any) => a.attempt === attempt)
        if (existingAttempt >= 0) {
          todaySession.attempts[existingAttempt] = { attempt, score, errors }
        } else {
          todaySession.attempts.push({ attempt, score, errors })
        }
      } else {
        // Create new session
        todaySession = {
          id: Date.now(),
          date: today,
          level,
          attempts: [{ attempt, score, errors }],
        }
        sessions.push(todaySession)
      }

      // Save back to localStorage
      localStorage.setItem("readingSessionHistory", JSON.stringify(sessions))
    }
  }, [level, attempt, score, errors])

  // This component doesn't render anything
  return null
}

