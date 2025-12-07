import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: "left" | "center"
  size?: "sm" | "md" | "lg"
  action?: React.ReactNode
}

const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, eyebrow, title, subtitle, align = "left", size = "md", action, ...props }, ref) => {
    const alignClasses = {
      left: "text-left",
      center: "text-center mx-auto",
    }
    const titleSizeClasses = {
      sm: "text-lg md:text-xl",
      md: "text-xl md:text-2xl",
      lg: "text-2xl md:text-3xl lg:text-4xl",
    }
    return (
      <div 
        ref={ref} 
        className={cn(
          "mb-6 md:mb-8",
          align === "center" ? "flex flex-col items-center" : "flex flex-col md:flex-row md:items-end md:justify-between gap-4",
          className
        )} 
        {...props}
      >
        <div className={cn(alignClasses[align], align === "center" && "max-w-2xl")}>
          {eyebrow && (
            <p className="text-xs md:text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              {eyebrow}
            </p>
          )}
          <h2 className={cn("font-bold text-white", titleSizeClasses[size])}>
            {title}
          </h2>
          {subtitle && (
            <p className={cn("text-slate-400 mt-2", size === "lg" ? "text-base md:text-lg" : "text-sm md:text-base")}>
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )
  }
)
SectionHeader.displayName = "SectionHeader"

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, breadcrumb, actions, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("mb-6 md:mb-8", className)} 
      {...props}
    >
      {breadcrumb && <div className="mb-3">{breadcrumb}</div>}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
)
PageHeader.displayName = "PageHeader"

export { SectionHeader, PageHeader }
