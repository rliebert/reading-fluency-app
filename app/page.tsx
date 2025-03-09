import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, BarChart3 } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-center text-4xl font-bold tracking-tight text-primary mb-2 md:text-5xl">Reading Stars</h1>
        <p className="text-center text-lg text-muted-foreground mb-8">Practice reading and track your progress!</p>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Start Reading
              </CardTitle>
              <CardDescription>
                Practice reading for one minute and see how many words you can read correctly.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <img
                src="/placeholder.svg?height=150&width=300"
                alt="Child reading with dog illustration"
                className="w-full h-[150px] object-cover rounded-md mb-4"
              />
            </CardContent>
            <CardFooter>
              <Link href="/reading" className="w-full">
                <Button size="lg" className="w-full text-lg">
                  Let's Read!
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="border-2 border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" />
                My Progress
              </CardTitle>
              <CardDescription>See how your reading is improving and collect rewards!</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <img
                src="/placeholder.svg?height=150&width=300"
                alt="Progress chart illustration"
                className="w-full h-[150px] object-cover rounded-md mb-4"
              />
            </CardContent>
            <CardFooter>
              <Link href="/progress" className="w-full">
                <Button size="lg" variant="outline" className="w-full text-lg">
                  View Progress
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Teachers & Parents:{" "}
            <Link href="/settings" className="text-primary hover:underline">
              Settings
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

