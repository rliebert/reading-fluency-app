import { CheckCircle2, Circle } from "lucide-react"

interface Achievement {
  id: number
  title: string
  description: string
  earned: boolean
  date?: string
}

interface AchievementsListProps {
  achievements: Achievement[]
}

export function AchievementsList({ achievements }: AchievementsListProps) {
  return (
    <div className="space-y-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`flex items-start p-4 rounded-lg border ${
            achievement.earned ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-muted"
          }`}
        >
          <div className={`mr-4 mt-1 ${achievement.earned ? "text-primary" : "text-muted-foreground"}`}>
            {achievement.earned ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
          </div>
          <div>
            <h3 className={`font-medium text-lg ${achievement.earned ? "text-primary" : "text-muted-foreground"}`}>
              {achievement.title}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{achievement.description}</p>
            {achievement.earned && achievement.date && (
              <p className="text-xs text-muted-foreground mt-2">
                Earned on {new Date(achievement.date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

