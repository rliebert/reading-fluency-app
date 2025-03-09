"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw } from "lucide-react"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { ReadingPassage } from "@/components/reading-passage"
import { ReadingResults } from "@/components/reading-results"
import { ReadingFeedback } from "@/components/reading-feedback"
import { RewardAnimation } from "@/components/reward-animation"
import { TestingUtility, type SimulationOptions } from "@/components/testing-utility"
import { useToast } from "@/hooks/use-toast"

// Sample reading passages with increasing difficulty
const READING_PASSAGES = [
  {
    id: 1,
    level: "Kindergarten",
    text: [
      "I have a dog. His name is Max. He is a big dog.",
      "Max has brown fur. His ears are soft. His tail wags when he is happy.",
      "Max likes to run. He runs in the yard. He runs very fast.",
      "Max likes to play with his ball. The ball is blue. He brings it back to me.",
      "Max can sit. He can stay. He is a good dog who listens well.",
      "Max likes to go for walks. We walk to the park. He likes to see other dogs.",
      "Max barks when he hears a noise. He wants to keep us safe. He is brave.",
      "At night, Max sleeps in his bed. His bed is by my room. He sleeps all night.",
      "In the morning, Max wakes up early. He is ready to play. He is full of energy.",
      "I love my dog Max. He is my best friend. We have fun together every day.",
    ],
    words: Array(150)
      .fill(0)
      .map((_, i) => `word${i}`), // This will be calculated from the text
  },
  {
    id: 2,
    level: "1st Grade",
    text: [
      "Sam has a red hat. The hat is on his head. Sam likes his hat.",
      "He wears it to school. His friends like his hat too. They want a hat like Sam's hat.",
      "One day, Sam's hat blew away in the wind. Sam was sad. He looked everywhere for his hat.",
      "Sam's friend Max helped him look. They searched the playground. They looked under the slide.",
      "They checked by the swings. No hat! They looked in the sandbox. Still no hat!",
      "Then Max pointed up. The hat was stuck in a tree! It was too high to reach.",
      "Sam had an idea. He found a long stick. He used the stick to tap the hat.",
      "The hat fell down slowly. Sam caught it with both hands. He was so happy!",
      "Sam put his hat back on his head. Max smiled at his friend. They went back to class together.",
      "Sam told the teacher about his adventure. The teacher was proud of Sam and Max for working together.",
    ],
    words: Array(200)
      .fill(0)
      .map((_, i) => `word${i}`), // This will be calculated from the text
  },
  {
    id: 3,
    level: "2nd Grade",
    text: [
      "Max and Lily went to the park on Saturday. They brought a ball to play with.",
      "Max threw the ball high in the air. Lily caught it with one hand. They played for hours and had a lot of fun.",
      "Suddenly, dark clouds filled the sky. The wind started to blow harder. It looked like rain was coming.",
      '"We should go home," said Lily. Max nodded. They packed up their things quickly.',
      "As they walked home, tiny raindrops began to fall. The raindrops got bigger and bigger.",
      "Max and Lily started to run. They laughed as they splashed through puddles. Their shoes got wet, but they didn't mind.",
      "They reached Lily's house first. Lily's mom invited Max to come inside and wait for the rain to stop.",
      "Lily's mom made hot chocolate with marshmallows. It was warm and delicious. Max and Lily sipped their drinks slowly.",
      "They watched the rain through the window. They saw lightning flash across the sky. Then they heard thunder boom.",
      "After the storm passed, a beautiful rainbow appeared. Max and Lily went outside to look at it. It had all seven colors.",
    ],
    words: Array(250)
      .fill(0)
      .map((_, i) => `word${i}`), // This will be calculated from the text
  },
  {
    id: 4,
    level: "3rd Grade",
    text: [
      "Emma planted a tiny seed in her garden. She watered it every day and made sure it got plenty of sunlight.",
      "After a week, Emma noticed a small green sprout pushing through the soil. She was so excited to see her plant growing!",
      "As the days passed, the plant grew taller and stronger. Soon, little buds appeared on the stems.",
      "Emma wondered what kind of flower it would be. Would it be red, yellow, or purple? She couldn't wait to find out.",
      "One morning, Emma ran to her garden and gasped. The buds had opened overnight! Beautiful orange flowers covered the plant.",
      '"Mom! Dad! Come see my flowers!" Emma called. Her parents came outside and smiled at the lovely blossoms.',
      "Emma's dad took a picture of her standing proudly next to her plant. Emma learned that her flowers were called marigolds.",
      "Emma's neighbor Mrs. Chen saw the flowers and asked if she could have some seeds when they were ready.",
      "Emma felt proud that she had grown something so beautiful from just a tiny seed. She decided to plant more flowers next spring.",
      "At school, Emma told her class about her garden. Her teacher suggested that they start a class garden together.",
    ],
    words: Array(300)
      .fill(0)
      .map((_, i) => `word${i}`), // This will be calculated from the text
  },
]

// Calculate the actual words for each passage
READING_PASSAGES.forEach((passage) => {
  const allText = passage.text.join(" ")
  passage.words = allText.split(/\s+/).filter((word) => word.length > 0)
})

export default function ReadingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [passageIndex, setPassageIndex] = useState(0)
  const [segmentIndex, setSegmentIndex] = useState(0)
  const [attempt, setAttempt] = useState(1)
  const [timeLeft, setTimeLeft] = useState(60)
  const [isReading, setIsReading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [testMode, setTestMode] = useState(true) // Enable test mode by default
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const passage = READING_PASSAGES[passageIndex]

  const { transcript, listening, startListening, stopListening, resetTranscript, hasRecognitionSupport } =
    useSpeechRecognition()

  useEffect(() => {
    if (!hasRecognitionSupport && !testMode) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Try using Chrome or Edge.",
        variant: "destructive",
      })
    }

    // Create audio elements
    audioRef.current = new Audio("/success.mp3") // This would be a real sound file in production

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [hasRecognitionSupport, toast, testMode])

  const handleSegmentChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < passage.text.length) {
      setSegmentIndex(newIndex)
    }
  }

  const startReading = () => {
    setIsReading(true)
    resetTranscript()

    if (!testMode) {
      startListening()
    }

    setTimeLeft(60)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishReading()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const pauseReading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (!testMode) {
      stopListening()
    }
    setIsReading(false)
  }

  const resetReading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (!testMode) {
      stopListening()
    }
    resetTranscript()
    setTimeLeft(60)
    setIsReading(false)
    setSegmentIndex(0)
  }

  const finishReading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    if (!testMode) {
      stopListening()
    }
    setIsReading(false)

    // In real mode, use the transcript
    if (!testMode) {
      // Calculate score (words read correctly per minute)
      const spokenWords = transcript
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 0)
      const passageWords = passage.words.map((word) => word.toLowerCase())

      let correctWords = 0
      const newErrors: string[] = []

      spokenWords.forEach((word, index) => {
        if (index < passageWords.length && word === passageWords[index]) {
          correctWords++
        } else if (index < passageWords.length) {
          newErrors.push(passageWords[index])
        }
      })

      const score = correctWords
      setScores([...scores, score])
      setErrors(newErrors)

      if (newErrors.length > 0) {
        setShowFeedback(true)
      } else {
        showResultsAndReward()
      }
    }
  }

  const handleSimulateReading = (options: SimulationOptions) => {
    // Simulate reading with the given options
    const passageWords = passage.words
    const totalWords = passageWords.length

    // Calculate how many words would be read in one minute
    let wordsRead = options.wordsPerMinute

    // Ensure we don't exceed the total words in the passage
    wordsRead = Math.min(wordsRead, totalWords)

    // Calculate errors based on error rate
    const errorCount = Math.round((wordsRead * options.errorRate) / 100)

    // Generate random error indices
    const errorIndices = new Set<number>()
    while (errorIndices.size < errorCount) {
      const randomIndex = Math.floor(Math.random() * wordsRead)
      errorIndices.add(randomIndex)
    }

    // Create the error list
    const simulatedErrors: string[] = []
    errorIndices.forEach((index) => {
      if (index < passageWords.length) {
        simulatedErrors.push(passageWords[index])
      }
    })

    // Apply improvement factor for subsequent attempts
    let adjustedScore = wordsRead - errorCount

    if (options.simulationType === "perfect") {
      adjustedScore = wordsRead
      simulatedErrors.length = 0
    } else if (options.simulationType === "struggling") {
      adjustedScore = Math.max(10, adjustedScore - 5)
    } else if (options.simulationType === "improving" && scores.length > 0) {
      adjustedScore = scores[scores.length - 1] + options.improvementFactor
    }

    // Update state with simulated results
    setScores([...scores, adjustedScore])
    setErrors(simulatedErrors)

    // Show feedback if there are errors
    if (simulatedErrors.length > 0) {
      setShowFeedback(true)
    } else {
      showResultsAndReward()
    }

    // Simulate the timer finishing
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setTimeLeft(0)
    setIsReading(false)
  }

  const handleFeedbackComplete = () => {
    setShowFeedback(false)
    showResultsAndReward()
  }

  const showResultsAndReward = () => {
    setShowResults(true)

    // Show reward animation if score improved
    if (scores.length > 1 && scores[scores.length - 1] > scores[scores.length - 2]) {
      setTimeout(() => {
        setShowReward(true)
        if (audioRef.current) {
          audioRef.current.play().catch((e) => console.error("Audio play error:", e))
        }
      }, 1000)
    }
  }

  const handleNextAttempt = () => {
    setShowResults(false)
    setShowReward(false)

    if (attempt < 3) {
      // Continue with next attempt of same passage
      setAttempt(attempt + 1)
      resetTranscript()
      setSegmentIndex(0)
    } else {
      // Move to next passage or finish
      if (passageIndex < READING_PASSAGES.length - 1) {
        setPassageIndex(passageIndex + 1)
        setAttempt(1)
        setScores([])
        setSegmentIndex(0)
      } else {
        // All passages completed
        router.push("/progress")
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl">
        {showReward && <RewardAnimation onComplete={() => setShowReward(false)} />}

        {showResults ? (
          <ReadingResults scores={scores} attempt={attempt} level={passage.level} onNext={handleNextAttempt} />
        ) : showFeedback ? (
          <ReadingFeedback errors={errors} onComplete={handleFeedbackComplete} />
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center">
              <h1 className="text-3xl font-bold text-primary mb-2">Reading Time!</h1>
              <div className="flex items-center gap-2 text-lg font-medium">
                <span>Level: {passage.level}</span>
                <span className="text-muted-foreground">|</span>
                <span>Attempt: {attempt} of 3</span>
              </div>

              <div className="w-full mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Time left: {timeLeft} seconds</span>
                  {listening && !testMode && (
                    <span className="text-green-500 flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Listening
                    </span>
                  )}
                  {testMode && isReading && (
                    <span className="text-yellow-500 flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                      Test Mode
                    </span>
                  )}
                </div>
                <Progress value={(timeLeft / 60) * 100} className="h-2" />
              </div>
            </div>

            <Card className="border-2 border-primary/20 shadow-md mb-6">
              <CardContent className="p-6">
                <ReadingPassage
                  text={passage.text[segmentIndex]}
                  currentSegmentIndex={segmentIndex}
                  onSegmentChange={handleSegmentChange}
                  totalSegments={passage.text.length}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-4">
                {!isReading ? (
                  <Button
                    size="lg"
                    onClick={startReading}
                    disabled={!hasRecognitionSupport && !testMode}
                    className="gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Start Reading
                  </Button>
                ) : (
                  <Button size="lg" variant="secondary" onClick={pauseReading} className="gap-2">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                )}

                <Button size="lg" variant="outline" onClick={resetReading} className="gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Reset
                </Button>
              </div>

              {isReading && (
                <Button size="lg" variant="default" onClick={finishReading} className="mt-2">
                  I'm Done Reading
                </Button>
              )}
            </div>

            {transcript && !testMode && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">What we heard:</p>
                <p className="text-muted-foreground">{transcript}</p>
              </div>
            )}
          </>
        )}

        {/* Always show the testing utility */}
        <TestingUtility
          onSimulateReading={handleSimulateReading}
          currentPassageLevel={passage.level}
          currentAttempt={attempt}
        />
      </div>
    </div>
  )
}

