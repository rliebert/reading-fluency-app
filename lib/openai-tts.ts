// This file implements the OpenAI TTS API client

export interface TTSOptions {
  text: string
  voice: string
  model: string
  speed: number
  teacherPersonality?: string
  preferredAccent?: "american" | "british" | "australian"
}

// Helper function to enhance text based on teacher personality
function enhanceTextWithPersonality(text: string, personality: string): string {
  // In a real implementation, this would be more sophisticated
  // For now, we'll add some simple enhancements

  switch (personality) {
    case "enthusiastic":
      // Add enthusiasm with exclamation marks and emphasis
      return text.replace(/\./g, "!").replace(/good/gi, "GREAT")

    case "gentle":
      // Add gentle encouragement
      return `That's right... ${text} Very good.`

    case "playful":
      // Add playful elements
      return `Ooh, let's try this fun word! ${text} Super job!`

    case "storyteller":
      // Add storytelling elements
      return `Now, listen carefully to this special word: ${text}`

    default:
      return text
  }
}

// Function to generate speech using OpenAI API
export async function generateSpeech(options: TTSOptions): Promise<string> {
  try {
    // Get API key from environment variable
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY

    if (!apiKey) {
      throw new Error("OpenAI API key is not set. Please set NEXT_PUBLIC_OPENAI_API_KEY environment variable.")
    }

    // Enhance text based on teacher personality if provided
    let textToSpeak = options.text
    if (options.teacherPersonality) {
      textToSpeak = enhanceTextWithPersonality(textToSpeak, options.teacherPersonality)
    }

    // Prepare request to OpenAI API
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model,
        voice: options.voice,
        input: textToSpeak,
        speed: options.speed,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`)
    }

    // Get audio data as blob
    const audioBlob = await response.blob()
    
    // Create a URL for the blob
    const audioUrl = URL.createObjectURL(audioBlob)
    
    return audioUrl
  } catch (error) {
    console.error("Error generating speech with OpenAI:", error)
    throw error
  }
}

// Helper function to speak text using OpenAI TTS
export async function speakWithOpenAI(options: TTSOptions): Promise<void> {
  try {
    console.log(
      `Using OpenAI TTS with voice: ${options.voice}, speed: ${options.speed}, personality: ${options.teacherPersonality}, accent: ${options.preferredAccent || "american"}`,
    )

    // Generate speech using OpenAI API
    const audioUrl = await generateSpeech(options)
    
    // Create audio element
    const audio = new Audio(audioUrl)
    
    // Play the audio
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        // Clean up the object URL when done
        URL.revokeObjectURL(audioUrl)
        resolve()
      }
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl)
        reject(e)
      }
      audio.play().catch((e) => {
        URL.revokeObjectURL(audioUrl)
        reject(e)
      })
    })
  } catch (error) {
    console.error("Error with OpenAI TTS:", error)
    
    // Fallback to browser's speech synthesis if OpenAI API fails
    console.log("Falling back to browser's speech synthesis")
    
    // Enhance the text based on teacher personality if provided
    let textToSpeak = options.text
    if (options.teacherPersonality) {
      textToSpeak = enhanceTextWithPersonality(textToSpeak, options.teacherPersonality)
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    utterance.rate = options.speed
    
    // Get all available voices
    const voices = window.speechSynthesis.getVoices()
    
    // Try to find a suitable voice
    if (voices.length > 0) {
      utterance.voice = voices[0]
    }
    
    // Play the audio
    window.speechSynthesis.speak(utterance)
    
    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve()
      utterance.onerror = (e) => reject(e)
    })
  }
}

