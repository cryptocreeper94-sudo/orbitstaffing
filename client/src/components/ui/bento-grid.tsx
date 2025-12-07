import * as React from "react"
import { cn } from "@/lib/utils"

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4
  gap?: "sm" | "md" | "lg"
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, cols = 3, gap = "md", children, ...props }, ref) => {
    const colClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    }
    const gapClasses = {
      sm: "gap-3",
      md: "gap-4 md:gap-6",
      lg: "gap-6 md:gap-8",
    }
    return (
      <div
        ref={ref}
        className={cn("grid w-full", colClasses[cols], gapClasses[gap], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BentoGrid.displayName = "BentoGrid"

interface BentoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2
}

const BentoTile = React.forwardRef<HTMLDivElement, BentoTileProps>(
  ({ className, span = 1, rowSpan = 1, children, ...props }, ref) => {
    const spanClasses = {
      1: "",
      2: "md:col-span-2",
      3: "md:col-span-2 lg:col-span-3",
      4: "col-span-full",
    }
    const rowSpanClasses = {
      1: "",
      2: "row-span-2",
    }
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm",
          "hover:border-cyan-500/30 transition-all duration-300",
          "overflow-hidden",
          spanClasses[span],
          rowSpanClasses[rowSpan],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BentoTile.displayName = "BentoTile"

export { BentoGrid, BentoTile }
