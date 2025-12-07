import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface OrbitCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "stat" | "media" | "action" | "glass"
  hover?: boolean
}

const OrbitCard = React.forwardRef<HTMLDivElement, OrbitCardProps>(
  ({ className, variant = "default", hover = true, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50",
      stat: "bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-cyan-500/20",
      media: "bg-slate-900 border-slate-700/50 overflow-hidden",
      action: "bg-gradient-to-br from-cyan-900/30 to-slate-900 border-cyan-500/30 cursor-pointer",
      glass: "bg-slate-800/40 backdrop-blur-md border-slate-600/30",
    }
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border p-4 md:p-5",
          variantClasses[variant],
          hover && "hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
OrbitCard.displayName = "OrbitCard"

interface OrbitCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  action?: React.ReactNode
}

const OrbitCardHeader = React.forwardRef<HTMLDivElement, OrbitCardHeaderProps>(
  ({ className, icon, action, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-start justify-between gap-3 mb-3", className)} {...props}>
      <div className="flex items-center gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div>{children}</div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
)
OrbitCardHeader.displayName = "OrbitCardHeader"

const OrbitCardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold text-white text-base md:text-lg", className)} {...props} />
  )
)
OrbitCardTitle.displayName = "OrbitCardTitle"

const OrbitCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-slate-400 mt-1", className)} {...props} />
  )
)
OrbitCardDescription.displayName = "OrbitCardDescription"

const OrbitCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
OrbitCardContent.displayName = "OrbitCardContent"

const OrbitCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between mt-4 pt-3 border-t border-slate-700/50", className)} {...props} />
  )
)
OrbitCardFooter.displayName = "OrbitCardFooter"

interface OrbitCardMediaProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  overlay?: boolean
}

const OrbitCardMedia = React.forwardRef<HTMLDivElement, OrbitCardMediaProps>(
  ({ className, src, alt, overlay = false, ...props }, ref) => (
    <div ref={ref} className={cn("relative -mx-4 -mt-4 md:-mx-5 md:-mt-5 mb-4 overflow-hidden", className)}>
      <img src={src} alt={alt || ""} className="w-full h-40 md:h-48 object-cover" {...props} />
      {overlay && <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />}
    </div>
  )
)
OrbitCardMedia.displayName = "OrbitCardMedia"

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; positive: boolean }
  className?: string
}

const StatCard = ({ label, value, icon, trend, className }: StatCardProps) => (
  <OrbitCard variant="stat" className={cn("", className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl md:text-3xl font-bold text-white mt-1">{value}</p>
        {trend && (
          <p className={cn("text-xs mt-1", trend.positive ? "text-emerald-400" : "text-red-400")}>
            {trend.positive ? "+" : ""}{trend.value}% from last period
          </p>
        )}
      </div>
      {icon && <div className="text-cyan-400">{icon}</div>}
    </div>
  </OrbitCard>
)

interface ActionCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

const ActionCard = ({ title, description, icon, onClick, className }: ActionCardProps) => (
  <OrbitCard variant="action" className={cn("group", className)} onClick={onClick}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {icon && <div className="text-cyan-400">{icon}</div>}
        <div>
          <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">{title}</p>
          {description && <p className="text-sm text-slate-400">{description}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
    </div>
  </OrbitCard>
)

export {
  OrbitCard,
  OrbitCardHeader,
  OrbitCardTitle,
  OrbitCardDescription,
  OrbitCardContent,
  OrbitCardFooter,
  OrbitCardMedia,
  StatCard,
  ActionCard,
}
