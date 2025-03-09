"use client"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"

interface ReadingPassageProps {
  text: string
  currentSegmentIndex: number
  onSegmentChange: (index: number) => void
  totalSegments: number
  transcript?: string
  isReading?: boolean
  autoAdvance?: boolean
}

export function ReadingPassage({ 
  text, 
  currentSegmentIndex, 
  onSegmentChange, 
  totalSegments,
  transcript = "",
  isReading = false,
  autoAdvance = false
}: ReadingPassageProps) {
  // Split text into words just for display purposes
  const words = text.split(/\s+/).filter(word => word.length > 0)

  return (
    <div className="reading-passage">
      <div className="text-2xl leading-relaxed font-medium tracking-wide mb-6">
        {text}
      </div>

      {totalSegments > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSegmentChange(currentSegmentIndex - 1)}
            disabled={currentSegmentIndex === 0}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Segment {currentSegmentIndex + 1} of {totalSegments}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSegmentChange(currentSegmentIndex + 1)}
            disabled={currentSegmentIndex === totalSegments - 1}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <style jsx>{`
        .reading-passage {
          line-height: 1.8;
        }
      `}</style>
    </div>
  )
}

