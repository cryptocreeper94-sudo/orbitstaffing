import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

interface CarouselRailProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  showArrows?: boolean
  arrowsOnMobile?: boolean
  gap?: "sm" | "md" | "lg"
  itemWidth?: "auto" | "sm" | "md" | "lg" | "xl"
}

const CarouselRail = React.forwardRef<HTMLDivElement, CarouselRailProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    showArrows = true, 
    arrowsOnMobile = false,
    gap = "md",
    itemWidth = "auto",
    children, 
    ...props 
  }, ref) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = React.useState(false)
    const [canScrollRight, setCanScrollRight] = React.useState(false)

    const checkScroll = React.useCallback(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        setCanScrollLeft(scrollLeft > 0)
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
      }
    }, [])

    React.useEffect(() => {
      checkScroll()
      const el = scrollRef.current
      if (el) {
        el.addEventListener("scroll", checkScroll)
        window.addEventListener("resize", checkScroll)
        return () => {
          el.removeEventListener("scroll", checkScroll)
          window.removeEventListener("resize", checkScroll)
        }
      }
    }, [checkScroll, children])

    const scroll = (direction: "left" | "right") => {
      if (scrollRef.current) {
        const scrollAmount = scrollRef.current.clientWidth * 0.8
        scrollRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        })
      }
    }

    const gapClasses = {
      sm: "gap-3",
      md: "gap-4",
      lg: "gap-6",
    }

    const itemWidthClasses = {
      auto: "",
      sm: "[&>*]:min-w-[200px] [&>*]:max-w-[200px]",
      md: "[&>*]:min-w-[280px] [&>*]:max-w-[280px]",
      lg: "[&>*]:min-w-[320px] [&>*]:max-w-[320px]",
      xl: "[&>*]:min-w-[380px] [&>*]:max-w-[380px]",
    }

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {(title || subtitle) && (
          <div className="flex items-end justify-between mb-4">
            <div>
              {title && <h3 className="text-lg md:text-xl font-bold text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
            </div>
            {showArrows && (
              <div className={cn("flex gap-2", !arrowsOnMobile && "hidden md:flex")}>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full border-slate-600 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-500",
                    !canScrollLeft && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full border-slate-600 bg-slate-800/80 hover:bg-slate-700 hover:border-cyan-500",
                    !canScrollRight && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
        <div
          ref={scrollRef}
          className={cn(
            "flex overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory",
            "-mx-4 px-4 md:-mx-0 md:px-0",
            gapClasses[gap],
            itemWidthClasses[itemWidth],
            "[&>*]:snap-start [&>*]:flex-shrink-0"
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)
CarouselRail.displayName = "CarouselRail"

const CarouselRailItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex-shrink-0", className)} {...props}>
      {children}
    </div>
  )
)
CarouselRailItem.displayName = "CarouselRailItem"

export { CarouselRail, CarouselRailItem }
