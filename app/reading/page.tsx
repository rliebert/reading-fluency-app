"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, RotateCcw, AlertTriangle, Mic, ArrowLeft } from "lucide-react"
import { ReadingPassage } from "@/components/reading-passage"
import { ReadingResults } from "@/components/reading-results"
import { ReadingFeedback } from "@/components/reading-feedback"
import { RewardAnimation } from "@/components/reward-animation"
import { TestingUtility, type SimulationOptions } from "@/components/testing-utility"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

// Extend Window interface to include microphoneStream property
declare global {
  interface Window {
    microphoneStream: MediaStream | null;
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

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
  const [testMode, setTestMode] = useState(false) // Disable test mode by default
  const [permissionDenied, setPermissionDenied] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Speech recognition state
  const [transcript, setTranscript] = useState("")
  const [listening, setListening] = useState(false)
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false)
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null)
  const [lastError, setLastError] = useState<string | null>(null)

  const passage = READING_PASSAGES[passageIndex]

  // Initialize speech recognition
  useEffect(() => {
    console.log("Initializing speech recognition...")
    
    // Check if browser supports speech recognition and if we're in a secure context
    const isSecureContext = typeof window !== 'undefined' && 
      (window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost');
    
    const hasSpeechRecognition = typeof window !== 'undefined' && 
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    
    console.log(`Secure context: ${isSecureContext}, Speech Recognition API available: ${!!hasSpeechRecognition}`);
    
    if (hasSpeechRecognition && isSecureContext) {
      setHasRecognitionSupport(true)
      
      try {
        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"
        recognition.maxAlternatives = 3

        // Set a longer speechRecognitionMaxSeconds if possible (not supported in all browsers)
        try {
          // @ts-ignore
          recognition.speechRecognitionMaxSeconds = 120; // Try to extend the default timeout
        } catch (err) {
          console.log("Could not set speech recognition max seconds:", err);
        }

        recognition.onresult = (event: any) => {
          console.log("Speech recognition result received", event.results.length);
          
          // Combine all results for better coverage
          let currentTranscript = ""
          
          for (let i = 0; i < event.results.length; i++) {
            // Check if this is a final result
            const isFinal = event.results[i].isFinal;
            
            // Get the most confident result
            const result = event.results[i][0].transcript;
            
            // For final results, use the entire text
            // For interim results, we might just want the latest words to avoid duplication
            if (isFinal || i === event.results.length - 1) {
              currentTranscript += " " + result;
            }
          }
          
          // Clean up the transcript (remove extra spaces, etc.)
          currentTranscript = currentTranscript.trim();
          
          console.log("Updated transcript:", currentTranscript);
          setTranscript(currentTranscript)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setLastError(`Error: ${event.error}`)

          // If we get a "no-speech" error, don't stop listening
          if (event.error !== "no-speech") {
            setListening(false)
          }
        }

        recognition.onend = () => {
          console.log("Speech recognition ended, listening state:", listening);
          // If we're still supposed to be listening, restart
          if (listening) {
            try {
              console.log("Restarting speech recognition...");
              recognition.start()
            } catch (e) {
              console.error("Error restarting speech recognition:", e)
              setLastError(`Restart error: ${e}`)
              setListening(false)
            }
          } else {
            setListening(false)
          }
        }

        recognition.onstart = () => {
          console.log("Speech recognition started successfully");
          setListening(true);
        }

        setRecognitionInstance(recognition)
        console.log("Recognition instance created successfully");
      } catch (err) {
        console.error("Error initializing speech recognition:", err);
        setLastError(`Initialization error: ${err}`);
        setHasRecognitionSupport(false);
      }
    } else {
      console.warn("Speech Recognition is not supported in this browser or requires a secure context (HTTPS)")
      setLastError("Speech Recognition not supported or not in secure context")
      setHasRecognitionSupport(false)
    }

    // Create audio elements
    audioRef.current = new Audio("/success.mp3")

    // Check microphone permission status on component mount
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          console.log("Initial microphone permission status:", permissionStatus.state);
          if (permissionStatus.state === 'denied') {
            setPermissionDenied(true);
            toast({
              title: "Microphone Access Denied",
              description: "Please allow microphone access in your browser settings to use speech recognition.",
              variant: "destructive",
            });
          }
          
          // Listen for permission changes
          permissionStatus.onchange = () => {
            console.log("Microphone permission changed to:", permissionStatus.state);
            if (permissionStatus.state === 'granted') {
              setPermissionDenied(false);
              toast({
                title: "Microphone Access Granted",
                description: "You can now use speech recognition.",
                variant: "default",
              });
            } else if (permissionStatus.state === 'denied') {
              setPermissionDenied(true);
              toast({
                title: "Microphone Access Denied",
                description: "Please allow microphone access in your browser settings to use speech recognition.",
                variant: "destructive",
              });
            }
          };
        })
        .catch(err => {
          console.error("Error checking microphone permission:", err);
        });
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Stop recognition if active
      if (recognitionInstance) {
        try {
          recognitionInstance.stop()
          console.log("Recognition stopped on cleanup");
        } catch (e) {
          console.error("Error stopping speech recognition:", e)
        }
      }
      
      // Also clean up any microphone stream
      if (window.microphoneStream) {
        window.microphoneStream.getTracks().forEach(track => track.stop());
        window.microphoneStream = null;
        console.log("Microphone stream released on cleanup");
      }
    }
  }, [toast])

  const startListening = async () => {
    console.log("Starting speech recognition...");
    
    if (!recognitionInstance) {
      console.error("Speech recognition not initialized")
      setLastError("Recognition not initialized")
      return
    }

    if (listening) {
      console.log("Already listening, no need to start again");
      return // Already listening
    }

    try {
      // Request microphone permission explicitly if not already granted
      if (!window.microphoneStream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        console.log("Requesting microphone permission...");
        toast({
          title: "Requesting Microphone Access",
          description: "Please allow microphone access when prompted by your browser.",
          variant: "default",
        });
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        window.microphoneStream = stream;
        console.log("Microphone permission granted and stream stored");
        
        toast({
          title: "Microphone Access Granted",
          description: "Speech recognition is now active. Start reading aloud!",
          variant: "default",
        });
      }
      
      console.log("Starting speech recognition instance...");
      recognitionInstance.start();
      setListening(true);
    } catch (error) {
      console.error("Error starting speech recognition:", error)
      setLastError(`Start error: ${error}`)
      setListening(false)
      setPermissionDenied(true);
      toast({
        title: "Microphone Access Issue",
        description: "There was a problem accessing your microphone. Please try again or enable Test Mode.",
        variant: "destructive",
      });
    }
  }

  const stopListening = () => {
    console.log("Stopping speech recognition...");
    if (recognitionInstance && listening) {
      try {
        recognitionInstance.stop()
      } catch (e) {
        console.error("Error stopping speech recognition:", e)
        setLastError(`Stop error: ${e}`)
      }
      setListening(false)
    }
  }

  const resetTranscript = () => {
    setTranscript("")
  }

  const handleSegmentChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < passage.text.length) {
      setSegmentIndex(newIndex)
    }
  }

  const startReading = async () => {
    setIsReading(true)
    resetTranscript()

    if (!testMode) {
      try {
        await startListening();
      } catch (error) {
        console.error("Failed to start listening:", error);
        setIsReading(false);
        return;
      }
    }

    setTimeLeft(60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          finishReading();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseReading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!testMode) {
      stopListening();
    }
    setIsReading(false);
  };

  const resetReading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!testMode) {
      stopListening();
      resetTranscript();
    }
    setTimeLeft(60);
    setIsReading(false);
    setSegmentIndex(0);
  };

  const finishReading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!testMode) {
      stopListening();
    }
    setIsReading(false);

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
              <div className="w-full flex items-center justify-between mb-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back Home
                  </Button>
                </Link>
                <h1 className="text-3xl font-bold text-primary">Reading Time!</h1>
                <div className="w-[73px]"></div> {/* Spacer for centering */}
              </div>
              
              <div className="flex items-center gap-2 text-lg font-medium">
                <span>Level: {passage.level}</span>
                <span className="text-muted-foreground">|</span>
                <span>Attempt: {attempt} of 3</span>
              </div>

              {/* Microphone status indicator */}
              {!testMode && (
                <div className={`mt-2 flex items-center gap-2 text-sm ${listening ? 'text-green-600' : 'text-yellow-600'}`}>
                  {listening ? (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      Microphone active - speak clearly
                    </>
                  ) : (
                    <>
                      <span className="relative flex h-3 w-3">
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                      </span>
                      Microphone inactive
                    </>
                  )}
                </div>
              )}

              {(!hasRecognitionSupport || permissionDenied) && (
                <div className="w-full mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Speech Recognition Unavailable</p>
                      <p className="text-sm text-yellow-700">
                        {permissionDenied 
                          ? "Microphone access was denied. Please allow microphone access in your browser settings."
                          : "Your browser doesn't support speech recognition. Try using Chrome or Edge."}
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Test Mode has been enabled so you can still try the app.
                      </p>
                      <div className="flex gap-2 mt-2">
                        {permissionDenied && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-yellow-100 hover:bg-yellow-200 border-yellow-300"
                            onClick={async () => {
                              try {
                                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                                  await navigator.mediaDevices.getUserMedia({ audio: true });
                                  setPermissionDenied(false);
                                  toast({
                                    title: "Microphone Access Granted",
                                    description: "You can now use speech recognition.",
                                    variant: "default",
                                  });
                                }
                              } catch (error) {
                                console.error("Failed to get microphone permission:", error);
                                toast({
                                  title: "Microphone Access Denied",
                                  description: "Please allow microphone access in your browser settings.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Request Microphone Permission
                          </Button>
                        )}
                        <Link href="/speech-test">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-blue-100 hover:bg-blue-200 border-blue-300"
                          >
                            <Mic className="h-3 w-3 mr-1" />
                            Speech Recognition Test
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add a direct link to the speech test page */}
              {!permissionDenied && hasRecognitionSupport && !isReading && (
                <div className="w-full mt-2 mb-4 flex justify-end">
                  <Link href="/speech-test">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                    >
                      <Mic className="h-3 w-3 mr-1" />
                      Speech Test
                    </Button>
                  </Link>
                </div>
              )}

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
                  transcript={transcript}
                  isReading={isReading && !testMode}
                  autoAdvance={false}
                />
              </CardContent>
            </Card>

            {/* Always show transcript area when in reading mode */}
            {isReading && !testMode && (
              <Card className="border-2 border-primary/20 shadow-md mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mic className="h-4 w-4 text-primary" />
                      Live Transcription
                    </h3>
                    {listening ? (
                      <span className="text-green-500 flex items-center gap-1 text-xs">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Listening to your voice...
                      </span>
                    ) : (
                      <span className="text-yellow-500 text-xs">Not listening</span>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3 min-h-[60px] border border-muted">
                    {transcript ? (
                      <p className="text-muted-foreground">{transcript}</p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        {listening ? "Waiting for speech..." : "Click 'Start Reading' to begin"}
                      </p>
                    )}
                  </div>
                  {lastError && (
                    <p className="text-xs text-red-500 mt-2">
                      Debug info: {lastError}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Add a simplified transcript display that's always visible */}
            {!isReading && !testMode && (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-muted">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Mic className="h-4 w-4 text-muted-foreground" />
                    Speech Recognition Status
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Click "Start Reading" to activate the microphone and begin reading aloud.
                  Your speech will be transcribed here in real-time.
                </p>
              </div>
            )}

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

            {/* Always show the testing utility */}
            <TestingUtility
              onSimulateReading={handleSimulateReading}
              currentPassageLevel={passage.level}
              currentAttempt={attempt}
              speechRecognitionSupported={hasRecognitionSupport && !permissionDenied}
            />
          </>
        )}
      </div>
    </div>
  )
}

