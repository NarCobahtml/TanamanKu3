"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-left"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:gap-3 group-[.toaster]:font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "text-emerald-700 dark:text-emerald-400",
          error: "text-rose-700 dark:text-rose-400",
          warning: "text-amber-700 dark:text-amber-400",
          info: "text-blue-700 dark:text-blue-400",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 shrink-0 text-emerald-500" />,
        info: <InfoIcon className="size-5 shrink-0 text-blue-500" />,
        warning: <TriangleAlertIcon className="size-5 shrink-0 text-amber-500" />,
        error: <OctagonXIcon className="size-5 shrink-0 text-rose-500" />,
        loading: <Loader2Icon className="size-5 shrink-0 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
