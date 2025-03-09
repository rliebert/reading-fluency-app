# Reading Stars

A web application designed to help Kindergarten through 3rd-grade students practice and improve their reading fluency. Students read passages aloud for one minute, and the system counts the number of correct words per minute, providing immediate feedback and encouraging improvement.

## Features

- One-minute timed reading sessions
- Speech recognition to track reading progress
- Feedback on words that need practice
- OpenAI TTS (Text-to-Speech) for high-quality voice feedback
- Progress tracking and visualization
- Rewards for improvement
- Progressively harder texts for different grade levels

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key for Text-to-Speech functionality

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```
   You can get an API key from the [OpenAI platform](https://platform.openai.com/api-keys).

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. From the home page, click "Let's Read!" to start a reading session.
2. Allow microphone access when prompted.
3. Read the displayed text aloud for one minute.
4. After the timer ends or when you click "I'm Done Reading", you'll receive feedback on any words that need practice.
5. Practice the highlighted words with the help of the TTS voice.
6. Complete three attempts for each passage to track improvement.
7. View your progress in the "My Progress" section.

## OpenAI TTS Integration

This application uses OpenAI's Text-to-Speech API to provide high-quality voice feedback. You can customize:

- Voice selection (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- Speech speed
- Teacher personality (Enthusiastic, Gentle, Playful, Storyteller)
- Accent preference (American, British, Australian)

## Test Mode

For testing or demonstration purposes, the application includes a test mode that simulates reading without requiring actual speech input. This is useful for:

- Demonstrating the app without reading aloud
- Testing different performance scenarios
- Previewing the feedback and reward systems

## License

This project is licensed under the MIT License - see the LICENSE file for details. 